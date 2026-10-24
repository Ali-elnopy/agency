import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { AuthModel } from './auth.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateAccessToken } from '../../utils/tokens.js';
import { generateRefreshToken, hashRefreshToken } from '../../utils/refreshTokens.js';
import { isMailerConfigured, sendPasswordResetEmail } from '../../utils/mailer.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOCK_DURATION_MS = 15 * 60 * 1000;
const RESET_TOKEN_TTL_MINUTES = 30;

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getPublicUser = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  isActive: user.isActive,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
  role: user.role,
  jobTitle: user.jobTitle ?? null,
});

export const AuthService = {
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase();
    const user = await AuthModel.findUserByEmail(normalizedEmail);

    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'This account is inactive');
    }

    const now = Date.now();

    if (user.loginLockedUntil && user.loginLockedUntil.getTime() > now) {
      throw new ApiError(423, 'Too many failed attempts. Please try again later.');
    }

    const passwordIsValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordIsValid) {
      const result = await AuthModel.recordFailedLoginAttempt(user.id, {
        maxAttempts: MAX_LOGIN_ATTEMPTS,
        windowMs: LOGIN_WINDOW_MS,
        lockDurationMs: LOCK_DURATION_MS,
        now,
      });

      if (result.locked) {
        throw new ApiError(423, 'Too many failed attempts. Please try again later.');
      }

      throw new ApiError(401, 'Invalid email or password');
    }

    const refreshToken = generateRefreshToken();

    const session = await AuthModel.createSession({
      userId: user.id,
      refreshTokenHash: hashRefreshToken(refreshToken),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: undefined,
      ipAddress: undefined,
    });

    await AuthModel.resetLoginFailures(user.id);
    await AuthModel.updateLastLogin(user.id);

    const accessToken = generateAccessToken(user, session.id);

    return {
      user: getPublicUser({
        ...user,
        lastLoginAt: new Date(),
      }),
      accessToken,
      refreshToken,
    };
  },

  async logout(userId, sessionId) {
    const session = await AuthModel.findSessionById(sessionId);

    if (!session || session.userId !== userId) {
      throw new ApiError(401, 'Invalid session');
    }

    if (session.revokedAt) {
      return { message: 'Already logged out' };
    }

    await AuthModel.revokeSession(sessionId, userId);

    return { message: 'Logout successful' };
  },

  async getCurrentUser(userId) {
    const user = await AuthModel.findUserById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is unavailable');
    }

    return user;
  },

  async changePassword(
    userId,
    currentSessionId,
    { currentPassword, newPassword },
    requestMeta = {},
  ) {
    const user = await AuthModel.findUserForPasswordChange(userId);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is unavailable');
    }

    const passwordIsValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!passwordIsValid) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    // Defense in depth: reject reuse of the current password.
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      throw new ApiError(400, 'New password must differ from current password');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await AuthModel.changePasswordAndAudit({
      userId,
      passwordHash,
      currentSessionId,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    return { message: 'Password changed successfully' };
  },

  /**
   * Starts the "forgot password" flow.
   *
   * The response is identical for known and unknown addresses so the endpoint
   * cannot be used to enumerate workspace accounts.
   */
  async requestPasswordReset({ email: rawEmail }) {
    if (!isMailerConfigured()) {
      throw new ApiError(
        503,
        'Password reset email is not configured yet. Ask your workspace admin for help.',
      );
    }

    const genericMessage =
      'If an account exists for that address, a reset link is on its way. Check your inbox and spam folder.';

    const email = String(rawEmail ?? '')
      .trim()
      .toLowerCase();

    const user = await AuthModel.findUserByEmail(email);

    if (!user || !user.isActive) return { message: genericMessage };

    const token = crypto.randomBytes(32).toString('hex');

    await AuthModel.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashResetToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000),
    });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        fullName: user.fullName,
        token,
        expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
      });
    } catch (error) {
      // Never surface delivery failures to the caller: that would reveal
      // whether the address belongs to an account.
      console.error('[auth] password reset email failed:', error?.message || error);
    }

    return { message: genericMessage };
  },

  async resetPassword({ token, newPassword }, requestMeta = {}) {
    const tokenIsMissing = !token || typeof token !== 'string';

    if (tokenIsMissing) {
      throw new ApiError(400, 'This reset link is invalid. Request a new one.');
    }

    const record = await AuthModel.findPasswordResetToken(hashResetToken(token));

    const expired =
      !record || Boolean(record.usedAt) || record.expiresAt.getTime() <= Date.now();

    if (expired) {
      throw new ApiError(400, 'This reset link is invalid or has expired. Request a new one.');
    }

    if (!record.user?.isActive) {
      throw new ApiError(400, 'This account is no longer active.');
    }

    const reusesCurrentPassword = await bcrypt.compare(newPassword, record.user.passwordHash);

    if (reusesCurrentPassword) {
      throw new ApiError(400, 'Choose a password you have not used before.');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const result = await AuthModel.consumePasswordResetToken({
      tokenId: record.id,
      userId: record.user.id,
      passwordHash,
      ipAddress: requestMeta.ipAddress,
      userAgent: requestMeta.userAgent,
    });

    if (!result.applied) {
      throw new ApiError(400, 'This reset link is invalid or has expired. Request a new one.');
    }

    return { message: 'Password updated. Sign in with your new password.' };
  },
};
