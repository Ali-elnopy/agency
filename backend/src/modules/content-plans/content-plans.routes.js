import { Router } from 'express';

import { ContentPlansController } from './content-plans.controller.js';
import {
  createContentPlanSchema,
  updateContentPlanSchema,
  updateContentPlanStatusSchema,
} from './content-plans.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validate } from '../../middlewares/validate.js';

export const contentPlansRouter = Router();

contentPlansRouter.use(authenticate);

contentPlansRouter.get('/', ContentPlansController.list);

contentPlansRouter.post(
  '/',
  requirePermission('CREATE_CONTENT'),
  validate(createContentPlanSchema),
  ContentPlansController.create,
);

contentPlansRouter.get('/:id', ContentPlansController.getById);

contentPlansRouter.patch(
  '/:id/status',
  requirePermission('REVIEW_CONTENT', 'MANAGE_CONTENT'),
  validate(updateContentPlanStatusSchema),
  ContentPlansController.updateStatus,
);

contentPlansRouter.patch(
  '/:id',
  requirePermission('MANAGE_CONTENT'),
  validate(updateContentPlanSchema),
  ContentPlansController.update,
);

contentPlansRouter.delete(
  '/:id',
  requirePermission('MANAGE_CONTENT'),
  ContentPlansController.remove,
);