import { asyncHandler } from '../../utils/asyncHandler.js';
import { DashboardService } from './dashboard.service.js';

export const DashboardController = {
  getStats: asyncHandler(async (_req, res) => {
    const data = await DashboardService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: 'Dashboard statistics retrieved successfully',
      data,
    });
  }),
};