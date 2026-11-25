import { Router } from 'express';

import {
  ContentItemsController,
} from './content-items.controller.js';

import {
  createContentItemSchema,
  updateContentItemSchema,
} from './content-items.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requireCreator } from '../../middlewares/requireCreator.js';
import { validate } from '../../middlewares/validate.js';
import { ClientChangeRequestsController } from '../client-change-requests/client-change-requests.controller.js';
import { clientReviewSchema } from '../client-change-requests/client-change-requests.validation.js';

export const contentItemsRouter =
  Router();

contentItemsRouter.use(authenticate);

contentItemsRouter.get(
  '/',
  ContentItemsController.list,
);

contentItemsRouter.post(
  '/',
  requireCreator,
  validate(createContentItemSchema),
  ContentItemsController.create,
);

contentItemsRouter.get(
  '/:id',
  ContentItemsController.getById,
);

contentItemsRouter.patch(
  '/:id',
  requireCreator,
  validate(updateContentItemSchema),
  ContentItemsController.update,
);

contentItemsRouter.post(
  '/:id/client-review',
  validate(clientReviewSchema),
  ClientChangeRequestsController.submitClientReview,
);

contentItemsRouter.delete(
  '/:id',
  requireCreator,
  ContentItemsController.remove,
);