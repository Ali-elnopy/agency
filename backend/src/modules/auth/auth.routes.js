import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { AuthController } from './auth.controller.js';
import {
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation.js';

import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';

export const authRouter = Router();

/**
 * Password reset endpoints are unauthenticated by design, so they get their own
 * IP-based budget: enough for a real person retrying, too little to brute force
 * tokens or spray reset emails.
 */
const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many reset requests from this network. Try again in a few minutes.',
  },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Request a fresh reset link and try again.',
  },
});

authRouter.post('/login', validate(loginSchema), AuthController.login);

authRouter.post(
  '/forgot-password',
  forgotLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);

authRouter.post(
  '/reset-password',
  resetLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

authRouter.get('/me', authenticate, AuthController.me);

authRouter.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword,
);

authRouter.post('/logout', authenticate, AuthController.logout);
