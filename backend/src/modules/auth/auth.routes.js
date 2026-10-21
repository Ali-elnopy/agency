import { Router } from 'express';

import { AuthController } from './auth.controller.js';
import { loginSchema, changePasswordSchema } from './auth.validation.js';

import { validate } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/auth.js';

export const authRouter = Router();

authRouter.post('/login', validate(loginSchema), AuthController.login);

authRouter.get('/me', authenticate, AuthController.me);

authRouter.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword,
);

authRouter.post('/logout', authenticate, AuthController.logout);
