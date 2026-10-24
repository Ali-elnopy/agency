import { Router } from 'express';
import { BrandsController } from './brands.controller.js';
import { createBrandSchema, updateBrandSchema } from './brands.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';

export const brandsRouter = Router();

brandsRouter.use(authenticate, requireAdmin);

brandsRouter.get('/', BrandsController.list);

brandsRouter.post('/', validate(createBrandSchema), BrandsController.create);

brandsRouter.get('/:id', BrandsController.getById);

brandsRouter.patch('/:id', validate(updateBrandSchema), BrandsController.update);

brandsRouter.delete('/:id', BrandsController.remove);
