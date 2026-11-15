import { Router } from 'express';

import { CampaignsController } from './campaigns.controller.js';

import {
  createCampaignSchema,
  updateCampaignSchema,
} from './campaigns.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validate } from '../../middlewares/validate.js';

export const campaignsRouter = Router();

campaignsRouter.use(authenticate);

campaignsRouter.get(
  '/',
  CampaignsController.list,
);

campaignsRouter.post(
  '/',
  requirePermission('CREATE_CONTENT'),
  validate(createCampaignSchema),
  CampaignsController.create,
);

campaignsRouter.get(
  '/:id',
  CampaignsController.getById,
);

campaignsRouter.patch(
  '/:id',
  requirePermission('MANAGE_CONTENT'),
  validate(updateCampaignSchema),
  CampaignsController.update,
);

campaignsRouter.delete(
  '/:id',
  requirePermission('MANAGE_CONTENT'),
  CampaignsController.remove,
);