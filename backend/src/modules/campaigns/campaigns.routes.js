import { Router } from 'express';

import { CampaignsController } from './campaigns.controller.js';

import {
  createCampaignSchema,
  updateCampaignSchema,
} from './campaigns.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

export const campaignsRouter = Router();

campaignsRouter.use(authenticate);

campaignsRouter.get(
  '/',
  CampaignsController.list,
);

campaignsRouter.post(
  '/',
  validate(createCampaignSchema),
  CampaignsController.create,
);

campaignsRouter.get(
  '/:id',
  CampaignsController.getById,
);

campaignsRouter.patch(
  '/:id',
  validate(updateCampaignSchema),
  CampaignsController.update,
);

campaignsRouter.delete(
  '/:id',
  CampaignsController.remove,
);