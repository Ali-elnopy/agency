import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { BrandBriefsController } from './brand-briefs.controller.js';
import {
    listBriefsQuerySchema,
    updateBriefSchema,
} from './brand-briefs.validation.js';

export const brandBriefsRouter = Router();

brandBriefsRouter.use(authenticate);

brandBriefsRouter.get(
    '/',
    validate(listBriefsQuerySchema, 'query'),
    BrandBriefsController.list,
);

brandBriefsRouter.get(
    '/:id',
    BrandBriefsController.getById,
);

brandBriefsRouter.patch(
    '/:id',
    validate(updateBriefSchema),
    BrandBriefsController.update,
);

brandBriefsRouter.post(
    '/:id/approve',
    BrandBriefsController.approve,
);

brandBriefsRouter.post(
    '/:brandId/generate',
    BrandBriefsController.generate,
);
