import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { createUserSchema, updateUserSchema } from './users.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';

export const usersRouter = Router();

// Every user-management endpoint requires a valid session and an ADMIN role.
usersRouter.use(authenticate, requireAdmin);

usersRouter.get('/', UsersController.list);
usersRouter.get('/:id', UsersController.getById);
usersRouter.post('/', validate(createUserSchema), UsersController.create);
usersRouter.patch('/:id', validate(updateUserSchema), UsersController.update);
usersRouter.post('/:id/deactivate', UsersController.deactivate);
usersRouter.post('/:id/reactivate', UsersController.reactivate);
usersRouter.delete('/:id', UsersController.remove);
