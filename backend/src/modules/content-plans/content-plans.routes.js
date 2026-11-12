
import { Router } from 'express';

import { ContentPlansController } from './content-plans.controller.js';
import {
  createContentPlanSchema,
  updateContentPlanSchema,
  updateContentPlanStatusSchema,
} from './content-plans.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { requireCreator } from '../../middlewares/requireCreator.js';
import { validate } from '../../middlewares/validate.js';

export const contentPlansRouter = Router();

contentPlansRouter.use(authenticate);

contentPlansRouter.get('/', ContentPlansController.list);

contentPlansRouter.post(
  '/',
  requireCreator,
  validate(createContentPlanSchema),
  ContentPlansController.create,
);

contentPlansRouter.get('/:id', ContentPlansController.getById);

contentPlansRouter.patch(
  '/:id/status',
  requireCreator,
  validate(updateContentPlanStatusSchema),
  ContentPlansController.updateStatus,
);

contentPlansRouter.patch(
  '/:id',
  requireCreator,
  validate(updateContentPlanSchema),
  ContentPlansController.update,
);

contentPlansRouter.delete('/:id', requireCreator, ContentPlansController.remove);
