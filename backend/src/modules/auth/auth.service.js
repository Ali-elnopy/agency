import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { AuthModel } from './auth.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateAccessToken } from '../../utils/tokens.js';
import { generateRefreshToken, hashRefreshToken } from '../../utils/refreshTokens.js';
import { isMailerConfigured, sendPasswordResetEmail } from '../../utils/mailer.js';
import { env } from '../../config/env.js';
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOCK_DURATION_MS = 15 * 60 * 1000;

/**
 * Password reset lifecycle:
 *   OTP (6 digits, 10 min, max 5 wrong attempts)
 *     → short-lived single-use reset token (10 min)
 *       → new password.
 *
 * Only SHA-256 hashes of the OTP and reset token are persisted. The raw values
 * exist only in the email message and in the verify-otp response.
 */
const OTP_TTL_MINUTES = 10;
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const RESET_TOKEN_TTL_MINUTES = 10;

const hashResetToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const timingSafeHashEqual = (left, right) => {
  if (typeof left !== 'string' || typeof right !== 'string') return false;
  if (left.length !== right.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
  } catch {
    return false;
  }
};

const generateOtp = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

const normalizeEmail = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase();

/** Database-offline fallback state (kept in memory, never written to disk). */
const inMemoryOtpByEmail = new Map();
const inMemoryResetByHash = new Map();
const inMemoryPasswords = new Map();
const FALLBACK_USERS = {
  'mohamedabdelsamad057@gmail.com': { id: 'usr-admin-mohamed', fullName: 'Mohamed Abdelsamad', email: 'mohamedabdelsamad057@gmail.com', isActive: true, role: { name: 'ADMIN' }, jobTitle: { name: 'Workspace Owner' } },
  'elena@agency-clean.co': { id: 'usr-admin-1', fullName: 'Elena Vance', email: 'elena@agency-clean.co', isActive: true, role: { name: 'ADMIN' }, jobTitle: { name: 'Workspace Owner' } },
  'omar@agency-clean.co': { id: 'usr-am-1', fullName: 'Omar Haddad', email: 'omar@agency-clean.co', isActive: true, role: { name: 'ACCOUNT_MANAGER' }, jobTitle: { name: 'Account Manager' } },
  'lina@agency-clean.co': { id: 'usr-cc-1', fullName: 'Lina Aziz', email: 'lina@agency-clean.co', isActive: true, role: { name: 'CONTENT_CREATOR' }, jobTitle: { name: 'Content Creator' } },
  'karim@agency-clean.co': { id: 'usr-cr-1', fullName: 'Karim Fouad', email: 'karim@agency-clean.co', isActive: true, role: { name: 'CREATIVE' }, jobTitle: { name: 'Video Editor' } },
  'sara@lumen.com': { id: 'usr-cl-1', fullName: 'Sara Nabil', email: 'sara@lumen.com', isActive: true, role: { name: 'CLIENT' }, jobTitle: { name: 'Client' } },
};

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
    let user;

    try {
      user = await AuthModel.findUserByEmail(normalizedEmail);
    } catch {
      throw new ApiError(
        503,
        'Authentication service is temporarily unavailable. Please try again later.',
      );
    }

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
      expiresAt: new Date(
        Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
      ),
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

  async refresh(refreshToken) {
    const oldTokenHash = hashRefreshToken(refreshToken);

    const session = await AuthModel.findSessionByRefreshTokenHash(oldTokenHash);

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      !session.user?.isActive
    ) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const newRefreshToken = generateRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    const rotated = await AuthModel.rotateRefreshToken({
      oldTokenHash,
      newTokenHash,
      expiresAt: session.expiresAt,
    });

    if (rotated.count !== 1) {
      throw new ApiError(401, 'Invalid or expired refresh token');
    }

    const accessToken = generateAccessToken(session.user, session.id);

    return {
      accessToken,
      refreshToken: newRefreshToken,
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

  async updateCurrentUserProfile(userId, input) {
    const existing = await AuthModel.findUserById(userId);

    if (!existing || !existing.isActive) {
      throw new ApiError(401, 'User account is unavailable');
    }

    const data = {};

    if (input.fullName !== undefined) {
      data.fullName = input.fullName;
    }

    if (input.phone !== undefined) {
      data.phone = input.phone || null;
    }

    return AuthModel.updateUserProfile(userId, data);
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
   * Starts the "forgot password" flow by emailing a 6-digit OTP.
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
      'If an account exists for that address, a verification code is on its way. Check your inbox and spam folder.';

    const email = normalizeEmail(rawEmail);

    if (!email) {
      throw new ApiError(400, 'Email is required.');
    }

    const { user, dbOffline } = await findUserForReset(email);

    // In production a database outage must never turn the endpoint into an
    // open relay; the generic response keeps the failure silent.
    if (dbOffline && process.env.NODE_ENV === 'production') {
      return { message: genericMessage };
    }

    if (!dbOffline && (!user || !user.isActive)) {
      // Deliberately identical to the known-account response.
      return { message: genericMessage };
    }

    const { code, expiresAt } = await createOtpRequest({ user, email, dbOffline });

    let mailMeta = {};
    let mailError = '';
    try {
      mailMeta = await sendPasswordResetEmail({
        to: user?.email || email,
        fullName: user?.fullName || FALLBACK_USERS[email]?.fullName || email.split('@')[0],
        token: code,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch (error) {
      // Keep the response generic even when the provider fails: revealing the
      // failure would also reveal that the account exists.
      mailError = error?.message || String(error);
      console.error('[auth] password reset email failed:', mailError);
    }

    return {
      message: genericMessage,
      provider: mailMeta?.provider || 'unknown',
      previewUrl: mailMeta?.previewUrl || '',
      expiresInMinutes: OTP_TTL_MINUTES,
      ...(process.env.NODE_ENV !== 'production'
        ? {
          code,
          email,
          expiresAt: expiresAt.toISOString(),
          ...(mailError ? { mailError } : {}),
        }
        : {}),
    };
  },

  /**
   * Issues a new OTP for an existing reset request. A short cooldown prevents
   * inbox flooding; the route-level limiter adds an IP-wide budget on top.
   */
  async resendOtp({ email: rawEmail }) {
    if (!isMailerConfigured()) {
      throw new ApiError(
        503,
        'Password reset email is not configured yet. Ask your workspace admin for help.',
      );
    }

    const genericMessage =
      'If an account exists for that address, a new verification code is on its way. Check your inbox and spam folder.';

    const email = normalizeEmail(rawEmail);

    if (!email) {
      throw new ApiError(400, 'Email is required.');
    }

    const { user, dbOffline } = await findUserForReset(email);

    if (dbOffline && process.env.NODE_ENV === 'production') {
      return { message: genericMessage };
    }

    if (!dbOffline && (!user || !user.isActive)) {
      return { message: genericMessage };
    }

    const latest = await findLatestOtp({ user, email, dbOffline });

    if (latest && !latest.usedAt) {
      const lastSentAt = latest.lastSentAt || latest.createdAt;
      const elapsedMs = Date.now() - new Date(lastSentAt).getTime();
      const waitMs = OTP_RESEND_COOLDOWN_SECONDS * 1000 - elapsedMs;

      if (waitMs > 0) {
        throw new ApiError(
          429,
          `Please wait ${Math.ceil(waitMs / 1000)} seconds before requesting another verification code.`,
        );
      }
    }

    const { code, expiresAt } = await createOtpRequest({ user, email, dbOffline });

    let mailMeta = {};
    try {
      mailMeta = await sendPasswordResetEmail({
        to: user?.email || email,
        fullName: user?.fullName || FALLBACK_USERS[email]?.fullName || email.split('@')[0],
        token: code,
        expiresInMinutes: OTP_TTL_MINUTES,
      });
    } catch (error) {
      console.error('[auth] verification code resend failed:', error?.message || error);
    }

    return {
      message: genericMessage,
      provider: mailMeta?.provider || 'unknown',
      previewUrl: mailMeta?.previewUrl || '',
      expiresInMinutes: OTP_TTL_MINUTES,
      ...(process.env.NODE_ENV !== 'production'
        ? {
          code,
          email,
          expiresAt: expiresAt.toISOString(),
        }
        : {}),
    };
  },

  /**
   * Verifies the 6-digit OTP and exchanges it for a short-lived, single-use
   * password-reset authorization token.
   */
  async verifyOtp({ email: rawEmail, otp }) {
    const email = normalizeEmail(rawEmail);

    if (!email) {
      throw new ApiError(400, 'Email is required.');
    }

    const providedOtp = String(otp ?? '').trim();

    if (!/^\d{6}$/.test(providedOtp)) {
      throw new ApiError(400, 'Enter the 6-digit verification code from your email.');
    }

    const { user, dbOffline } = await findUserForReset(email);

    if (!dbOffline && (!user || !user.isActive)) {
      throw invalidOtpError();
    }

    const { record, usedDb } = await findLatestOtpWithSource({ user, email, dbOffline });

    if (!record) throw invalidOtpError();

    if (record.usedAt || record.verifiedAt) {
      throw new ApiError(
        400,
        'This verification code has already been used. Request a new code.',
      );
    }

    const expiresAt = new Date(record.expiresAt);

    if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      throw new ApiError(
        400,
        'This verification code has expired. Request a new verification code.',
      );
    }

    const attempts = Number(record.attempts || 0);

    if (attempts >= OTP_MAX_ATTEMPTS) {
      await invalidateOtpRecord({ record, usedDb });
      throw new ApiError(
        429,
        'Too many incorrect attempts. Request a new verification code.',
      );
    }

    const providedHash = hashResetToken(providedOtp);
    const expectedHash = record.tokenHash || record.otpHash;

    if (!timingSafeHashEqual(expectedHash, providedHash)) {
      const nextAttempts = attempts + 1;

      if (usedDb) {
        try {
          await AuthModel.incrementPasswordResetAttempts(record.id);
        } catch {
          // Best-effort counter update; the response stays the same.
        }
      } else {
        record.attempts = nextAttempts;
      }

      if (nextAttempts >= OTP_MAX_ATTEMPTS) {
        await invalidateOtpRecord({ record, usedDb });
        throw new ApiError(
          429,
          'Too many incorrect attempts. Request a new verification code.',
        );
      }

      const remaining = OTP_MAX_ATTEMPTS - nextAttempts;
      throw new ApiError(
        400,
        `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashResetToken(resetToken);
    const resetTokenExpiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000,
    );

    let issuedInDb = false;

    if (usedDb) {
      try {
        await AuthModel.issueResetToken({
          tokenId: record.id,
          resetTokenHash,
          resetTokenExpiresAt,
        });
        issuedInDb = true;
      } catch {
        // Fall back to the in-memory store below.
      }
    }

    if (!issuedInDb) {
      const memoryRecord = {
        ...record,
        email: record.email || email,
        userId: record.userId ?? user?.id ?? null,
        resetTokenHash,
        resetTokenExpiresAt,
        verifiedAt: new Date(),
        usedAt: null,
      };

      inMemoryResetByHash.set(resetTokenHash, memoryRecord);
      inMemoryOtpByEmail.set(memoryRecord.email, memoryRecord);
    }

    return {
      message: 'Verification successful. Choose a new password.',
      resetToken,
      email: user?.email || email,
      expiresInMinutes: RESET_TOKEN_TTL_MINUTES,
    };
  },

  /**
   * Consumes a verified reset token, updates the password, invalidates the OTP
   * and revokes every existing session for that account.
   */
  async resetPassword({ resetToken, token, newPassword }, requestMeta = {}) {
    const rawToken = String(resetToken || token || '').trim();

    if (!/^[a-f0-9]{64}$/i.test(rawToken)) {
      throw new ApiError(
        400,
        'This reset authorization is invalid or has expired. Verify your email code again.',
      );
    }

    const resetTokenHash = hashResetToken(rawToken);
    let record = null;
    let usedDb;

    try {
      record = await AuthModel.findPasswordResetByResetTokenHash(resetTokenHash);
      usedDb = true;
    } catch {
      usedDb = false;
    }

    if (!usedDb) {
      record = inMemoryResetByHash.get(resetTokenHash) || null;
    }

    if (!record) {
      throw new ApiError(
        400,
        'This reset authorization is invalid or has expired. Verify your email code again.',
      );
    }

    const resetExpiresAt = record.resetTokenExpiresAt
      ? new Date(record.resetTokenExpiresAt)
      : null;

    const expired =
      Boolean(record.usedAt) ||
      !record.resetTokenHash ||
      !resetExpiresAt ||
      Number.isNaN(resetExpiresAt.getTime()) ||
      resetExpiresAt.getTime() <= Date.now();

    if (expired) {
      throw new ApiError(
        400,
        'This reset authorization has expired or was already used. Verify your email code again.',
      );
    }

    const memoryUser = {
      id: record.userId,
      email: record.email,
      isActive: true,
      passwordHash: record.email ? inMemoryPasswords.get(record.email) : null,
    };
    const user = record.user || memoryUser;

    if (!user || user.isActive === false) {
      throw new ApiError(400, 'This account is no longer active.');
    }

    if (user.passwordHash) {
      const reusesCurrentPassword = await bcrypt.compare(newPassword, user.passwordHash);

      if (reusesCurrentPassword) {
        throw new ApiError(400, 'Choose a password you have not used before.');
      }
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    if (usedDb && user.id) {
      const result = await AuthModel.consumePasswordResetToken({
        tokenId: record.id,
        userId: user.id,
        passwordHash,
        ipAddress: requestMeta.ipAddress,
        userAgent: requestMeta.userAgent,
      });

      if (!result.applied) {
        throw new ApiError(
          400,
          'This reset authorization was already used or has expired. Verify your email code again.',
        );
      }
    } else {
      record.usedAt = new Date();
      if (record.email) {
        inMemoryPasswords.set(record.email, passwordHash);
        const otpRecord = inMemoryOtpByEmail.get(record.email);
        if (otpRecord && otpRecord !== record) otpRecord.usedAt = new Date();
      }
      inMemoryResetByHash.delete(resetTokenHash);
    }

    const email = user.email || record.email;

    if (email) {
      inMemoryOtpByEmail.delete(email);
    }

    return {
      message: 'Password updated. Sign in with your new password.',
      email,
    };
  },
};

/* ------------------------------------------------------------------------- *
 * Password-reset helpers
 * ------------------------------------------------------------------------- */

async function findUserForReset(email) {
  try {
    return { user: await AuthModel.findUserByEmail(email), dbOffline: false };
  } catch {
    // Database offline — hybrid mode keeps the reset flow usable locally.
    return { user: null, dbOffline: true };
  }
}

async function findLatestOtp({ user, email, dbOffline }) {
  const { record } = await findLatestOtpWithSource({ user, email, dbOffline });
  return record;
}

async function findLatestOtpWithSource({ user, email, dbOffline }) {
  if (!dbOffline && user?.id) {
    try {
      return {
        record: await AuthModel.findLatestOtpForUser(user.id),
        usedDb: true,
      };
    } catch {
      // Fall through to the in-memory store.
    }
  }

  return { record: inMemoryOtpByEmail.get(email) || null, usedDb: false };
}

async function createOtpRequest({ user, email, dbOffline }) {
  const code = generateOtp();
  const tokenHash = hashResetToken(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  let persisted = false;

  if (!dbOffline && user?.id) {
    try {
      await AuthModel.createPasswordResetToken({
        userId: user.id,
        tokenHash,
        expiresAt,
      });
      persisted = true;
    } catch {
      // Fall back to memory.
    }
  }

  if (!persisted) {
    const previous = inMemoryOtpByEmail.get(email);

    if (previous && !previous.usedAt) {
      previous.usedAt = new Date();
    }

    inMemoryOtpByEmail.set(email, {
      id: crypto.randomUUID(),
      email,
      userId: user?.id ?? null,
      otpHash: tokenHash,
      expiresAt,
      attempts: 0,
      usedAt: null,
      verifiedAt: null,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
      createdAt: new Date(),
      lastSentAt: new Date(),
    });
  }

  return { code, expiresAt };
}

async function invalidateOtpRecord({ record, usedDb }) {
  if (!record) return;

  record.usedAt = record.usedAt || new Date();

  if (usedDb && record.id) {
    try {
      await AuthModel.markPasswordResetTokenUsed(record.id);
    } catch {
      // Nothing else to do; the token also fails closed on expiry.
    }
  }
}

function invalidOtpError() {
  return new ApiError(
    400,
    'Invalid or expired verification code. Request a new verification code.',
  );
}
