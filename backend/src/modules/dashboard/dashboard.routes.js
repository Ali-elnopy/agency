import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticate } from '../../middlewares/auth.js';
import { requireAdmin } from '../../middlewares/requireAdmin.js';

export const dashboardRouter = Router();

// Only authenticated admins can access dashboard statistics.
dashboardRouter.use(authenticate, requireAdmin);

dashboardRouter.get('/', DashboardController.getStats);