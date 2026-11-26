import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import {
  progressQuerySchema,
  teamPerformanceQuerySchema,
} from './dashboard.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';
import { validate } from '../../middlewares/validate.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);

// Only authenticated admins can access agency overview dashboard statistics.
dashboardRouter.get('/', requireAdmin, DashboardController.getStats);

dashboardRouter.get(
  '/progress',
  validate(progressQuerySchema, 'query'),
  DashboardController.getProgress,
);

dashboardRouter.get(
  '/team-performance',
  validate(teamPerformanceQuerySchema, 'query'),
  DashboardController.getTeamPerformance,
);
