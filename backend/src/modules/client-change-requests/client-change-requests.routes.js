import { Router } from 'express';

import { ClientChangeRequestsController } from './client-change-requests.controller.js';
import {
  listClientChangeRequestsQuerySchema,
  resolveClientChangeRequestSchema,
  forwardClientChangeRequestSchema,
} from './client-change-requests.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

export const clientChangeRequestsRouter = Router();

clientChangeRequestsRouter.use(authenticate);

clientChangeRequestsRouter.get(
  '/',
  validate(listClientChangeRequestsQuerySchema, 'query'),
  ClientChangeRequestsController.list,
);

clientChangeRequestsRouter.get(
  '/:id',
  ClientChangeRequestsController.getById,
);

clientChangeRequestsRouter.patch(
  '/:id/resolve',
  validate(resolveClientChangeRequestSchema),
  ClientChangeRequestsController.resolve,
);

clientChangeRequestsRouter.patch(
  '/:id/forward',
  validate(forwardClientChangeRequestSchema),
  ClientChangeRequestsController.forward,
);
