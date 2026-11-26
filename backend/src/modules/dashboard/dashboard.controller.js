import { asyncHandler } from '../../utils/asyncHandler.js';
import { DashboardService } from './dashboard.service.js';
import {
  progressQuerySchema,
  teamPerformanceQuerySchema,
} from './dashboard.validation.js';

export const DashboardController = {
  getStats: asyncHandler(async (_req, res) => {
    const data = await DashboardService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data,
    });
  }),

  getProgress: asyncHandler(async (req, res) => {
    const filters = progressQuerySchema.parse(req.query);
    const data = await DashboardService.getProgress(filters, req.user);

    res.status(200).json({
      success: true,
      message: 'Progress metrics retrieved successfully',
      data,
    });
  }),

  getTeamPerformance: asyncHandler(async (req, res) => {
    const filters = teamPerformanceQuerySchema.parse(req.query);
    const data = await DashboardService.getTeamPerformance(filters, req.user);

    res.status(200).json({
      success: true,
      message: 'Team performance retrieved successfully',
      data,
    });
  }),
};
