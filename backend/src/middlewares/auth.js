import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { AuthModel } from '../modules/auth/auth.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured');
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'orvia-agency-os',
      audience: 'orvia-api',
    });

    if (
      typeof payload === 'string' ||
      typeof payload.sub !== 'string' ||
      typeof payload.sid !== 'string' ||
      !/^\d+$/.test(payload.sub)
    ) {
      throw new ApiError(401, 'Invalid access token');
    }

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId <= 0) {
      throw new ApiError(401, 'Invalid access token');
    }

    const session = await AuthModel.findSessionById(payload.sid);

    if (
      !session ||
      session.userId !== userId ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    ) {
      throw new ApiError(401, 'Session is invalid or expired');
    }

    const user = await AuthModel.findUserById(userId);

    if (!user || !user.isActive) {
      throw new ApiError(401, 'User account is unavailable');
    }

    req.user = user;
    req.authSession = { id: session.id };
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.NotBeforeError
    ) {
      return next(new ApiError(401, 'Invalid or expired access token'));
    }

    next(error);
  }
};
