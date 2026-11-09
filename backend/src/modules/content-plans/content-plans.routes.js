
import { Router } from 'express';

import { ContentPlansController } from './content-plans.controller.js';
import {
  createContentPlanSchema,
  updateContentPlanSchema,
  updateContentPlanStatusSchema,
} from './content-plans.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { requireRoles } from '../../middlewares/authorization.js';
import { validate } from '../../middlewares/validate.js';

export const contentPlansRouter = Router();

contentPlansRouter.use(authenticate);

contentPlansRouter.get('/', ContentPlansController.list);

contentPlansRouter.post(
  '/',
  requireRoles('ADMIN', 'ACCOUNT_MANAGER'),
  validate(createContentPlanSchema),
  ContentPlansController.create,
);

contentPlansRouter.get('/:id', ContentPlansController.getById);

contentPlansRouter.patch(
  '/:id/status',
  requireRoles('ADMIN', 'ACCOUNT_MANAGER', 'CONTENT_CREATOR'),
  validate(updateContentPlanStatusSchema),
  ContentPlansController.updateStatus,
);

contentPlansRouter.patch(
  '/:id',
  requireRoles('ADMIN', 'ACCOUNT_MANAGER', 'CONTENT_CREATOR'),
  validate(updateContentPlanSchema),
  ContentPlansController.update,
);

contentPlansRouter.delete('/:id', requireAdmin, ContentPlansController.remove);
