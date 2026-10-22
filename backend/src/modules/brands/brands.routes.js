
import { Router } from 'express';
import { BrandsController } from './brands.controller.js';
import { createBrandSchema } from './brands.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';

export const brandsRouter = Router();

brandsRouter.use(authenticate, requireAdmin);

brandsRouter.post(
  '/',
  validate(createBrandSchema),
  BrandsController.create,
);
