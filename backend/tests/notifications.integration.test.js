
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const state = vi.hoisted(() => ({
    user: null,
    session: null,
}));

const {
    mockFindSessionById,
    mockFindUserById,
    mockListForUser,
    mockCountUnreadForUser,
    mockMarkAsRead,
    mockMarkAllAsRead,
} = vi.hoisted(() => ({
    mockFindSessionById: vi.fn(),
    mockFindUserById: vi.fn(),
    mockListForUser: vi.fn(),
    mockCountUnreadForUser: vi.fn(),
    mockMarkAsRead: vi.fn(),
    mockMarkAllAsRead: vi.fn(),
}));

vi.mock('../src/modules/auth/auth.model.js', () => ({
    AuthModel: {
        findSessionById: mockFindSessionById,
        findUserById: mockFindUserById,
    },
}));

vi.mock('../src/modules/notifications/notifications.model.js', () => ({
    NotificationsModel: {
        listForUser: mockListForUser,
        countUnreadForUser: mockCountUnreadForUser,
        markAsRead: mockMarkAsRead,
        markAllAsRead: mockMarkAllAsRead,
    },
}));

process.env.JWT_SECRET ||= 'integration-test-secret';

const { default: app } = await import('../src/app.js');

function createToken() {
    return jwt.sign(
        { sid: state.session.id },
        process.env.JWT_SECRET,
        {
            subject: String(state.user.id),
            issuer: 'orvia-agency-os',
            audience: 'orvia-api',
            expiresIn: '15m',
        },
    );
}

const notifications = [
    {
        id: 1,
        type: 'CONTENT_PLAN_SUBMITTED',
        title: 'Content Plan Submitted',
        message: 'The content plan has been submitted for review.',
        data: { contentPlanId: 1001, brandId: 501 },
        isRead: false,
        readAt: null,
        createdAt: new Date('2026-11-24T10:00:00.000Z'),
    },
    {
        id: 2,
        type: 'CONTENT_PLAN_APPROVED',
        title: 'Content Plan Approved',
        message: 'The content plan has been approved.',
        data: { contentPlanId: 1002, brandId: 502 },
        isRead: true,
        readAt: new Date('2026-11-24T11:00:00.000Z'),
        createdAt: new Date('2026-11-24T09:00:00.000Z'),
    },
];

let accessToken;

function authenticateAs(userId = 101) {
    state.user = {
        id: userId,
        email: `user${userId}@test.com`,
        role: 'CLIENT',
        isActive: true,
    };

    state.session = {
        id: `session-${userId}`,
        userId,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    accessToken = createToken();
}

function api(method, path) {
    return request(app)[method](path)
        .set('Authorization', `Bearer ${accessToken}`);
}

describe('Notifications Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        authenticateAs();

        mockFindSessionById.mockImplementation(async (sessionId) =>
            state.session?.id === sessionId ? state.session : null,
        );

        mockFindUserById.mockImplementation(async (userId) =>
            state.user?.id === userId ? state.user : null,
        );

        mockListForUser.mockResolvedValue(notifications);

        mockCountUnreadForUser.mockResolvedValue(1);

        mockMarkAsRead.mockResolvedValue({
            ...notifications[0],
            isRead: true,
            readAt: new Date(),
        });

        mockMarkAllAsRead.mockResolvedValue({
            count: 3,
        });
    });

    describe('GET /api/notifications', () => {
        it('returns notifications belonging to the authenticated user', async () => {
            const response = await api('get', '/api/notifications');

            expect(response.status).toBe(200);

            expect(mockListForUser).toHaveBeenCalledOnce();
            expect(mockListForUser).toHaveBeenCalledWith(101);
        });

        it('does not request notifications for another user', async () => {
            authenticateAs(202);

            const response = await api('get', '/api/notifications');

            expect(response.status).toBe(200);

            expect(mockListForUser).toHaveBeenCalledWith(202);
            expect(mockListForUser).not.toHaveBeenCalledWith(101);
        });
    });

    describe('GET /api/notifications/unread-count', () => {
        it('returns the unread notifications count for the authenticated user', async () => {
            const response = await api(
                'get',
                '/api/notifications/unread-count',
            );

            expect(response.status).toBe(200);

            expect(mockCountUnreadForUser).toHaveBeenCalledOnce();
            expect(mockCountUnreadForUser).toHaveBeenCalledWith(101);
        });
    });

    describe('PATCH /api/notifications/:id/read', () => {
        it('marks an owned notification as read', async () => {
            const response = await api(
                'patch',
                '/api/notifications/1/read',
            );

            expect(response.status).toBe(200);

            expect(mockMarkAsRead).toHaveBeenCalledOnce();
            expect(mockMarkAsRead).toHaveBeenCalledWith(1, 101);
        });

        it('returns 404 when the notification does not belong to the user or does not exist', async () => {
            mockMarkAsRead.mockResolvedValue(null);

            const response = await api(
                'patch',
                '/api/notifications/999/read',
            );

            expect(response.status).toBe(404);

            expect(mockMarkAsRead).toHaveBeenCalledWith(999, 101);
        });

        it('returns 400 when notification ID is invalid', async () => {
            const response = await api(
                'patch',
                '/api/notifications/abc/read',
            );

            expect(response.status).toBe(400);

            expect(mockMarkAsRead).not.toHaveBeenCalled();
        });
    });

    describe('PATCH /api/notifications/read-all', () => {
        it('marks all unread notifications belonging to the authenticated user as read', async () => {
            const response = await api(
                'patch',
                '/api/notifications/read-all',
            );

            expect(response.status).toBe(200);

            expect(mockMarkAllAsRead).toHaveBeenCalledOnce();
            expect(mockMarkAllAsRead).toHaveBeenCalledWith(101);
        });
    });
});
