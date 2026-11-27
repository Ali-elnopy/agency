
import { Router } from 'express';

import { TasksController } from './tasks.controller.js';

import {
  createDirectTaskSchema,
  assignContentItemTasksSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskListQuerySchema,
  attachSubmissionSchema,
  submitContentTaskSchema,
  reviewTaskSchema,
} from './tasks.validation.js';

import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

export const tasksRouter = Router();

tasksRouter.use(authenticate);

tasksRouter.get(
  '/',
  validate(taskListQuerySchema, 'query'),
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

tasksRouter.post(
  '/:id/submit',
  validate(submitContentTaskSchema),
  TasksController.submitContentTask,
);

tasksRouter.patch(
  '/:id/attach',
  validate(attachSubmissionSchema),
  TasksController.attachSubmission,
);

tasksRouter.patch(
  '/:id/review',
  validate(reviewTaskSchema),
  TasksController.review,
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
