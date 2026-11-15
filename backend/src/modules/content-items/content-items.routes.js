import { Router } from 'express';

import {
  ContentItemsController,
} from './content-items.controller.js';

import {
  createContentItemSchema,
  updateContentItemSchema,
} from './content-items.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
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
  requirePermission('CREATE_CONTENT'),
  validate(createContentItemSchema),
  ContentItemsController.create,
);

contentItemsRouter.get(
  '/:id',
  ContentItemsController.getById,
);

contentItemsRouter.patch(
  '/:id',
  requirePermission('MANAGE_CONTENT'),
  validate(updateContentItemSchema),
  ContentItemsController.update,
);

contentItemsRouter.delete(
  '/:id',
  requirePermission('MANAGE_CONTENT'),
  ContentItemsController.remove,
);