import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { AuthController } from './auth.controller.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resendOtpSchema,
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
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many reset requests from this network. Try again in a few minutes.',
  },
});

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts. Request a fresh verification code and try again.',
  },
});

/**
 * OTP verification gets a tighter budget than ordinary form posts: five wrong
 * codes already lock the record, so this stops distributed guessing too.
 */
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many verification attempts from this network. Try again later.',
  },
});
const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many refresh attempts. Please try again later.',
  },
});
authRouter.get('/mail-status', AuthController.mailStatus);
authRouter.post('/mail-config', AuthController.updateMailConfig);
authRouter.post('/login', validate(loginSchema), AuthController.login);
authRouter.post(
  '/refresh',
  refreshLimiter,
  validate(refreshTokenSchema),
  AuthController.refresh,
);
authRouter.post(
  '/forgot-password',
  forgotLimiter,
  validate(forgotPasswordSchema),
  AuthController.forgotPassword,
);

authRouter.post(
  '/verify-otp',
  otpVerifyLimiter,
  validate(verifyOtpSchema),
  AuthController.verifyOtp,
);

authRouter.post(
  '/resend-otp',
  forgotLimiter,
  validate(resendOtpSchema),
  AuthController.resendOtp,
);

authRouter.post(
  '/reset-password',
  resetLimiter,
  validate(resetPasswordSchema),
  AuthController.resetPassword,
);

authRouter.get('/me', authenticate, AuthController.me);
authRouter.patch(
  '/me',
  authenticate,
  validate(updateProfileSchema),
  AuthController.updateMe,
);

authRouter.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword,
);

authRouter.post('/logout', authenticate, AuthController.logout);
