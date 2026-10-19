import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';
import * as c from './auth.controller.js';
import * as v from './auth.validation.js';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', authLimiter, validate({ body: v.loginSchema }), c.login);
router.post('/refresh', validate({ body: v.refreshSchema }), c.refresh);
router.post('/logout', validate({ body: v.refreshSchema }), c.logout);
router.post('/forgot-password', authLimiter, validate({ body: v.forgotPasswordSchema }), c.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: v.resetPasswordSchema }), c.resetPassword);
router.post('/change-password', authenticate, validate({ body: v.changePasswordSchema }), c.changePassword);
router.get('/me', authenticate, c.me);

export default router;
