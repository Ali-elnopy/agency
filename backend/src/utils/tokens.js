import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signAccessToken = (user) =>
  jwt.sign({ role: user.role }, env.JWT_ACCESS_SECRET, {
    subject: user.id,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  });

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

// Opaque random token (بيتخزن hash بس في الـ DB)
export const generateOpaqueToken = () => crypto.randomBytes(48).toString('hex');
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
