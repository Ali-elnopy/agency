import { Router } from 'express';

import {
  ContentItemsController,
} from './content-items.controller.js';

import {
  calendarQuerySchema,
  createContentItemSchema,
  listRevisionsQuerySchema,
  updateContentItemSchema,
  updatePublishingSchema,
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
  '/calendar',
  validate(calendarQuerySchema, 'query'),
  ContentItemsController.getCalendar,
);

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
  '/:id/revisions',
  validate(listRevisionsQuerySchema, 'query'),
  ContentItemsController.listRevisions,
);

contentItemsRouter.get(
  '/:id/revisions/:revisionId',
  ContentItemsController.getRevisionById,
);

contentItemsRouter.get(
  '/:id/publishing',
  ContentItemsController.getPublishing,
);

contentItemsRouter.patch(
  '/:id/publishing',
  validate(updatePublishingSchema),
  ContentItemsController.updatePublishing,
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
