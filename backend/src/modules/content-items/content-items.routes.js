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

contentItemsRouter.delete(
  '/:id',
  requireCreator,
  ContentItemsController.remove,
);