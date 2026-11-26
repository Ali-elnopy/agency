
import { Router } from 'express';

import { ClientRequestsController } from './client-requests.controller.js';

import {
    createClientRequestSchema,
    acceptClientRequestSchema,
    rejectClientRequestSchema,
    clientRequestListQuerySchema,
} from './client-requests.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

export const clientRequestsRouter = Router();

clientRequestsRouter.use(authenticate);

clientRequestsRouter.get(
    '/',
    validate(clientRequestListQuerySchema, 'query'),
    ClientRequestsController.list,
);

clientRequestsRouter.post(
    '/',
    validate(createClientRequestSchema),
    ClientRequestsController.create,
);

clientRequestsRouter.get(
    '/:id',
    ClientRequestsController.getById,
);

clientRequestsRouter.patch(
    '/:id/accept',
    validate(acceptClientRequestSchema),
    ClientRequestsController.accept,
);

clientRequestsRouter.patch(
    '/:id/reject',
    validate(rejectClientRequestSchema),
    ClientRequestsController.reject,
);
