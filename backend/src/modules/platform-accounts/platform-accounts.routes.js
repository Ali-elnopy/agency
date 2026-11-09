
import { Router } from 'express';

import { PlatformAccountsController } from './platform-accounts.controller.js';
import {
  createPlatformAccountSchema,
  updatePlatformAccountSchema,
  updatePlatformAccountStatusSchema,
} from './platform-accounts.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';

export const platformAccountsRouter = Router();

platformAccountsRouter.use(authenticate);

platformAccountsRouter.get('/', PlatformAccountsController.list);

platformAccountsRouter.post(
  '/',
  validate(createPlatformAccountSchema),
  PlatformAccountsController.create,
);

platformAccountsRouter.get('/:id', PlatformAccountsController.getById);

platformAccountsRouter.patch(
  '/:id/status',
  validate(updatePlatformAccountStatusSchema),
  PlatformAccountsController.updateStatus,
);

platformAccountsRouter.patch(
  '/:id',
  validate(updatePlatformAccountSchema),
  PlatformAccountsController.update,
);

platformAccountsRouter.delete('/:id', PlatformAccountsController.remove);
