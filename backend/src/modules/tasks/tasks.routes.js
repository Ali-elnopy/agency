import { Router } from 'express';

import { TasksController } from './tasks.controller.js';

import {
  createDirectTaskSchema,
  assignContentItemTasksSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from './tasks.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get(
  '/',
  TasksController.list,
);

tasksRouter.get(
  '/:id',
  TasksController.getById,
);

tasksRouter.post(
  '/direct',
  validate(createDirectTaskSchema),
  TasksController.createDirectTask,
);

tasksRouter.post(
  '/content-items/:contentItemId/assign',
  validate(assignContentItemTasksSchema),
  TasksController.assignContentItemTasks,
);

tasksRouter.patch(
  '/:id/status',
  validate(updateTaskStatusSchema),
  TasksController.updateStatus,
);

tasksRouter.patch(
  '/:id',
  validate(updateTaskSchema),
  TasksController.update,
);

tasksRouter.delete(
  '/:id',
  TasksController.remove,
);