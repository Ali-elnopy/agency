
import { NotificationsModel } from './notifications.model.js';
import { ApiError } from '../../utils/ApiError.js';

function ensureAuthenticatedUser(user) {
    if (!Number.isSafeInteger(user?.id) || user.id <= 0) {
        throw new ApiError(401, 'Authenticated user not found');
    }
}

function parseNotificationId(value) {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        throw new ApiError(400, 'Notification id must be a positive integer');
    }

    return id;
}

export const NotificationsService = {
    async list(user) {
        ensureAuthenticatedUser(user);
        return NotificationsModel.listForUser(user.id);
    },

    async getUnreadCount(user) {
        ensureAuthenticatedUser(user);
        const count = await NotificationsModel.countUnreadForUser(user.id);
        return { unreadCount: count };
    },

    async markAsRead(user, notificationId) {
        ensureAuthenticatedUser(user);
        const id = parseNotificationId(notificationId);
        const notification = await NotificationsModel.markAsRead(id, user.id);

        if (!notification) {
            throw new ApiError(404, 'Notification not found');
        }

        return notification;
    },

    async markAllAsRead(user) {
        ensureAuthenticatedUser(user);
        const result = await NotificationsModel.markAllAsRead(user.id);
        return { updatedCount: result.count };
    },
};
