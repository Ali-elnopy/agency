
import { prisma } from '../../config/prisma.js';

const notificationSelect = {
    id: true,
    type: true,
    title: true,
    message: true,
    data: true,
    isRead: true,
    readAt: true,
    createdAt: true,
};

export const NotificationsModel = {
    listForUser(recipientId) {
        return prisma.notification.findMany({
            where: { recipientId },
            select: notificationSelect,
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        });
    },

    countUnreadForUser(recipientId) {
        return prisma.notification.count({
            where: { recipientId, isRead: false },
        });
    },

    findForUserById(id, recipientId) {
        return prisma.notification.findFirst({
            where: { id, recipientId },
            select: notificationSelect,
        });
    },

    async markAsRead(id, recipientId) {
        const notification = await prisma.notification.findFirst({
            where: { id, recipientId },
            select: { id: true, isRead: true },
        });

        if (!notification) return null;

        if (!notification.isRead) {
            await prisma.notification.update({
                where: { id: notification.id },
                data: { isRead: true, readAt: new Date() },
            });
        }

        return this.findForUserById(id, recipientId);
    },

    markAllAsRead(recipientId) {
        return prisma.notification.updateMany({
            where: { recipientId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
    },
};
