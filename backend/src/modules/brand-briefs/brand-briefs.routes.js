
import { Router } from 'express';

import { authenticate } from '../../middlewares/auth.js';
import { BrandBriefsController } from './brand-briefs.controller.js';

export const brandBriefsRouter = Router();

brandBriefsRouter.use(authenticate);

brandBriefsRouter.post(
    '/:brandId/generate',
    BrandBriefsController.generate,
);
