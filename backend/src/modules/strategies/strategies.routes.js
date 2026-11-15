
import { Router } from 'express';

import { StrategiesController } from './strategies.controller.js';

import {
    createStrategySchema,
    updateStrategySchema,
    strategyFeedbackSchema,
    strategyApprovalSchema,
} from './strategies.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validate } from '../../middlewares/validate.js';

import {
    strategyUpload,
    handleStrategyUploadError,
} from './strategies.storage.js';

import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const strategiesRouter = Router();

strategiesRouter.use(authenticate);

strategiesRouter.get(
    '/',
    StrategiesController.list,
);

strategiesRouter.post(
    '/',
    requirePermission('CREATE_CONTENT'),
    validate(createStrategySchema),
    StrategiesController.create,
);

strategiesRouter.get(
    '/:id',
    StrategiesController.getById,
);

strategiesRouter.patch(
    '/:id',
    requirePermission('MANAGE_CONTENT'),
    validate(updateStrategySchema),
    StrategiesController.update,
);

strategiesRouter.delete(
    '/:id',
    requirePermission('MANAGE_CONTENT'),
    StrategiesController.remove,
);

strategiesRouter.post(
    '/:id/versions',
    requirePermission('CREATE_CONTENT', 'MANAGE_CONTENT'),
    strategyUpload.single('file'),
    handleStrategyUploadError,
    StrategiesController.uploadVersion,
);

strategiesRouter.get(
    '/:id/versions/:versionId/file',
    StrategiesController.getVersionFile,
);

strategiesRouter.post(
    '/:id/versions/:versionId/feedback',
    validate(strategyFeedbackSchema),
    StrategiesController.requestChanges,
);

strategiesRouter.post(
    '/:id/versions/:versionId/approve',
    validate(strategyApprovalSchema),
    StrategiesController.approve,
);
