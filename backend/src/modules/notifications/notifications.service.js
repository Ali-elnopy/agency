
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
    async create(data, db) {
        const recipientId = Number(data?.recipientId);

        if (!Number.isSafeInteger(recipientId) || recipientId <= 0) {
            throw new ApiError(400, 'Invalid notification recipient');
        }

        if (
            typeof data?.type !== 'string' ||
            !data.type.trim() ||
            typeof data?.title !== 'string' ||
            !data.title.trim() ||
            typeof data?.message !== 'string' ||
            !data.message.trim()
        ) {
            throw new ApiError(
                400,
                'Notification type, title, and message are required',
            );
        }

        return NotificationsModel.create(
            {
                recipientId,
                type: data.type.trim(),
                title: data.title.trim(),
                message: data.message.trim(),
                data: data.data ?? null,
            },
            db,
        );
    },

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
