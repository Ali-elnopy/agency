import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { signAccessToken, generateOpaqueToken, hashToken } from '../../utils/tokens.js';
import { sendMail } from '../../utils/mailer.js';
import { audit } from '../../utils/audit.js';

const DAY = 24 * 60 * 60 * 1000;

export const toSafeUser = ({ passwordHash: _p, ...user }) => user;

async function issueTokens(user) {
  const refreshToken = generateOpaqueToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * DAY),
    },
  });
  return { accessToken: signAccessToken(user), refreshToken };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  // نفس الرسالة في كل الحالات عشان منكشفش وجود الإيميل
  const ok = user && user.isActive && (await bcrypt.compare(password, user.passwordHash));
  if (!ok) throw ApiError.unauthorized('Invalid email or password');

  return { user: toSafeUser(user), ...(await issueTokens(user)) };
}

// Refresh token rotation + reuse detection
export async function refresh(refreshToken) {
  const record = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(refreshToken) },
    include: { user: true },
  });
  if (!record) throw ApiError.unauthorized('Invalid refresh token');

  if (record.revokedAt) {
    await prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw ApiError.unauthorized('Refresh token reuse detected');
  }
  if (record.expiresAt < new Date() || !record.user.isActive) {
    throw ApiError.unauthorized('Refresh token expired');
  }

  await prisma.refreshToken.update({ where: { id: record.id }, data: { revokedAt: new Date() } });
  return issueTokens(record.user);
}

export async function logout(refreshToken) {
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.isActive) {
    const token = generateOpaqueToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await sendMail({
      to: user.email,
      subject: 'Reset your password',
      text: `${env.FRONTEND_URL}/reset-password?token=${token}`,
    });
  }
  // دايمًا نفس الرد
}

export async function resetPassword({ token, newPassword }) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(newPassword, 12) },
    }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);
  await audit({ actorId: record.userId, action: 'PASSWORD_RESET', entity: 'User', entityId: record.userId });
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw ApiError.badRequest('Current password is incorrect');
  }
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await audit({ actorId: userId, action: 'PASSWORD_CHANGED', entity: 'User', entityId: userId });
}
