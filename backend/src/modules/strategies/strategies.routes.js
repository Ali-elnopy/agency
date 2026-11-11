
import { Router } from 'express';

import { StrategiesController } from './strategies.controller.js';

import {
    createStrategySchema,
    updateStrategySchema,
    strategyFeedbackSchema,
    strategyApprovalSchema,
} from './strategies.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

import {
    strategyUpload,
    handleStrategyUploadError,
} from './strategies.storage.js';

import { ApiError } from '../../utils/ApiError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const strategiesRouter = Router();

strategiesRouter.use(authenticate);

// Check the uploader's role before Multer writes anything to disk.
const requireContentCreator = asyncHandler(async (req, res, next) => {
    const isContentCreator =
        req.user?.role?.name === 'EMPLOYEE' &&
        req.user?.jobTitle?.name === 'Content Creator';

    if (!isContentCreator) {
        throw new ApiError(
            403,
            'Only Content Creators can upload strategy files',
        );
    }

    next();
});

strategiesRouter.get(
    '/',
    StrategiesController.list,
);

strategiesRouter.post(
    '/',
    validate(createStrategySchema),
    StrategiesController.create,
);

strategiesRouter.get(
    '/:id',
    StrategiesController.getById,
);

strategiesRouter.patch(
    '/:id',
    validate(updateStrategySchema),
    StrategiesController.update,
);

strategiesRouter.post(
    '/:id/versions',
    requireContentCreator,
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
