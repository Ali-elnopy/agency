import { prisma } from '../../config/prisma.js';

const publicUserSelect = {
  id: true,
  fullName: true,
  email: true,
  phone: true,
  isActive: true,
  lastLoginAt: true,
  createdAt: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  jobTitle: {
    select: {
      id: true,
      name: true,
    },
  },
};

export const AuthModel = {
  findUserByEmailForPassword(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });
  },

  createSession(data) {
    return prisma.authSession.create({ data });
  },

  findSessionById(id) {
    return prisma.authSession.findUnique({
      where: { id },
    });
  },

  revokeSession(sessionId, userId) {
    return prisma.authSession.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  },

  findUserByEmail(email) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          select: { id: true, name: true },
        },
      },
    });
  },

  findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  },

  updateLastLogin(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        lastLoginAt: new Date(),
      },
    });
  },

  resetLoginFailures(userId) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        failedLoginWindowStart: null,
        loginLockedUntil: null,
      },
    });
  },

  recordFailedLogin(userId, attempts, windowStart, lockedUntil) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: attempts,
        failedLoginWindowStart: windowStart,
        loginLockedUntil: lockedUntil,
      },
    });
  },

  updatePassword(userId, passwordHash) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  findUserForPasswordChange(userId) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        passwordHash: true,
        isActive: true,
      },
    });
  },

  async changePasswordAndAudit({ userId, passwordHash, currentSessionId, ipAddress, userAgent }) {
    return prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      // Keep the current session active.
      // Revoke every other active session.
      await tx.authSession.updateMany({
        where: {
          userId,
          id: { not: currentSessionId },
          revokedAt: null,
        },
        data: { revokedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'AUTH_PASSWORD_CHANGED',
          targetType: 'User',
          targetId: String(userId),
          ipAddress: ipAddress?.slice(0, 45),
          userAgent: userAgent?.slice(0, 500),
        },
      });
    });
  },

  createPasswordResetToken({ userId, tokenHash, expiresAt }) {
    return prisma.$transaction(async (tx) => {
      // A new link always invalidates the previous unused ones.
      await tx.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });

      return tx.passwordResetToken.create({
        data: { userId, tokenHash, expiresAt },
      });
    });
  },

  findPasswordResetToken(tokenHash) {
    return prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            passwordHash: true,
            isActive: true,
          },
        },
      },
    });
  },

  consumePasswordResetToken({ tokenId, userId, passwordHash, ipAddress, userAgent }) {
    return prisma.$transaction(async (tx) => {
      const now = new Date();

      // Claim the token atomically: a concurrent request cannot reuse it.
      const claimed = await tx.passwordResetToken.updateMany({
        where: { id: tokenId, usedAt: null, expiresAt: { gt: now } },
        data: { usedAt: now },
      });

      if (claimed.count === 0) return { applied: false };

      await tx.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: now },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          failedLoginAttempts: 0,
          failedLoginWindowStart: null,
          loginLockedUntil: null,
        },
      });

      // A password reset signs the account out everywhere.
      await tx.authSession.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: now },
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'AUTH_PASSWORD_RESET',
          targetType: 'User',
          targetId: String(userId),
          ipAddress: ipAddress?.slice(0, 45),
          userAgent: userAgent?.slice(0, 500),
        },
      });

      return { applied: true };
    });
  },
};
