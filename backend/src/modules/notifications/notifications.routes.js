
import { Router } from 'express';

import { NotificationsController } from './notifications.controller.js';
import { notificationIdParamsSchema } from './notifications.validation.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/', NotificationsController.list);

notificationsRouter.get(
    '/unread-count',
    NotificationsController.getUnreadCount,
);

notificationsRouter.patch(
    '/read-all',
    NotificationsController.markAllAsRead,
);

notificationsRouter.patch(
    '/:id/read',
    validate(notificationIdParamsSchema, 'params'),
    NotificationsController.markAsRead,
);
