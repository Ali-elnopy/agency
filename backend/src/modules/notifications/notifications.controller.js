
import { NotificationsService } from './notifications.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const NotificationsController = {
    list: asyncHandler(async (req, res) => {
        const notifications = await NotificationsService.list(req.user);

        res.status(200).json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: notifications,
        });
    }),

    getUnreadCount: asyncHandler(async (req, res) => {
        const result = await NotificationsService.getUnreadCount(req.user);

        res.status(200).json({
            success: true,
            message: 'Unread notification count retrieved successfully',
            data: result,
        });
    }),

    markAsRead: asyncHandler(async (req, res) => {
        const notification = await NotificationsService.markAsRead(
            req.user,
            req.params.id,
        );

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    }),

    markAllAsRead: asyncHandler(async (req, res) => {
        const result = await NotificationsService.markAllAsRead(req.user);

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read',
            data: result,
        });
    }),
};
