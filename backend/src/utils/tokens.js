import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateAccessToken = (user, sessionId) =>
  jwt.sign(
    { sub: String(user.id), sid: sessionId },
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN,
      issuer: 'orvia-agency-os',
      audience: 'orvia-api',
    },
  );
