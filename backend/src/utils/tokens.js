import jwt from 'jsonwebtoken';

export const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      sub: String(user.id),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      issuer: 'orvia-agency-os',
      audience: 'orvia-api',
    },
  );
};
