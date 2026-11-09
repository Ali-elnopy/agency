
import { Router } from 'express';

import { BrandsController } from './brands.controller.js';
import {
    createBrandSchema,
    updateBrandSchema,
} from './brands.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';

export const brandsRouter = Router();

brandsRouter.use(authenticate);

// Read routes: access is scoped inside BrandsService.
brandsRouter.get('/', BrandsController.list);
brandsRouter.get('/:id', BrandsController.getById);

// Write routes: Admin only.
brandsRouter.post(
    '/',
    requireAdmin,
    validate(createBrandSchema),
    BrandsController.create,
);

brandsRouter.patch(
    '/:id',
    requireAdmin,
    validate(updateBrandSchema),
    BrandsController.update,
);

brandsRouter.delete(
    '/:id',
    requireAdmin,
    BrandsController.remove,
);
