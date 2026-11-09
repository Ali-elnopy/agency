
import jwt from 'jsonwebtoken';

export const generateAccessToken = (user, sessionId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      sub: String(user.id),
      sid: sessionId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      issuer: 'orvia-agency-os',
      audience: 'orvia-api',
    },
  );
};
