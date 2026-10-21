import bcrypt from 'bcryptjs';
import { AuthModel } from './auth.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { generateAccessToken } from '../../utils/tokens.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOCK_DURATION_MS = 15 * 60 * 1000;

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
    const user = await AuthModel.findUserByEmail(email.toLowerCase());

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
      const currentWindowStart = user.failedLoginWindowStart?.getTime();

      const windowExpired = !currentWindowStart || now - currentWindowStart >= LOGIN_WINDOW_MS;

      const attempts = windowExpired ? 1 : user.failedLoginAttempts + 1;

      const windowStart = windowExpired ? new Date(now) : user.failedLoginWindowStart;

      const lockedUntil = attempts >= MAX_LOGIN_ATTEMPTS ? new Date(now + LOCK_DURATION_MS) : null;

      await AuthModel.recordFailedLogin(user.id, attempts, windowStart, lockedUntil);

      if (lockedUntil) {
        throw new ApiError(423, 'Too many failed attempts. Please try again later.');
      }

      throw new ApiError(401, 'Invalid email or password');
    }

    await AuthModel.resetLoginFailures(user.id);
    await AuthModel.updateLastLogin(user.id);

    const accessToken = generateAccessToken(user);

    return {
      user: getPublicUser({
        ...user,
        lastLoginAt: new Date(),
      }),
      accessToken,
    };
  },

  async getCurrentUser(userId) {
    const user = await AuthModel.findUserById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is unavailable');
    }

    return user;
  },

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await AuthModel.findUserByEmailForPassword?.(userId);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is unavailable');
    }

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!valid) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await AuthModel.updatePassword(userId, passwordHash);

    return { message: 'Password changed successfully' };
  },
};
