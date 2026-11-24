
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

const state = vi.hoisted(() => ({
    user: null,
    session: null,
    plan: null,
}));

const {
    mockFindSessionById,
    mockFindUserById,
    mockFindAccessibleById,
    mockFindById,
    mockFindAccessibleBrandById,
    mockUpdate,
    mockNotificationCreate,
    mockTransaction,
} = vi.hoisted(() => ({
    mockFindSessionById: vi.fn(),
    mockFindUserById: vi.fn(),
    mockFindAccessibleById: vi.fn(),
    mockFindById: vi.fn(),
    mockFindAccessibleBrandById: vi.fn(),
    mockUpdate: vi.fn(),
    mockNotificationCreate: vi.fn(),
    mockTransaction: vi.fn(),
}));

// Mock Authentication Model.
// Keep the real authenticate middleware.
vi.mock('../src/modules/auth/auth.model.js', () => ({
    AuthModel: {
        findSessionById: mockFindSessionById,
        findUserById: mockFindUserById,
    },
}));

// Mock Content Plans Model.
vi.mock('../src/modules/content-plans/content-plans.model.js', () => ({
    ContentPlansModel: {
        findAccessibleById: mockFindAccessibleById,
        findById: mockFindById,
        findAccessibleBrandById: mockFindAccessibleBrandById,
        update: mockUpdate,
    },
}));

// Mock Notifications Model.
vi.mock('../src/modules/notifications/notifications.model.js', () => ({
    NotificationsModel: {
        create: mockNotificationCreate,
    },
}));

// Mock Prisma transaction.
vi.mock('../src/config/prisma.js', () => ({
    prisma: {
        $transaction: mockTransaction,
    },
}));

process.env.JWT_SECRET ||= 'integration-test-secret';

// Import app after registering mocks.
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

const clientUser = {
    id: 101,
    fullName: 'Test Client',
    email: 'client@test.com',
    isActive: true,
    role: {
        id: 4,
        name: 'CLIENT',
    },
};

const accountManagerUser = {
    id: 201,
    fullName: 'Test Account Manager',
    email: 'manager@test.com',
    isActive: true,
    role: {
        id: 2,
        name: 'ACCOUNT_MANAGER',
    },
};

const contentCreatorUser = {
    id: 301,
    fullName: 'Test Content Creator',
    email: 'creator@test.com',
    isActive: true,
    role: {
        id: 3,
        name: 'EMPLOYEE',
    },
    jobTitle: {
        name: 'Content Creator',
    },
};

const brand = {
    id: 501,
    name: 'Test Brand',
    clientId: 101,
    accountManagerId: 201,
    teamId: 701,
    team: {
        memberships: [
            { userId: 301 },
        ],
    },
};

function createPlan(status) {
    return {
        id: 1001,
        brandId: 501,
        platformAccountId: 601,
        title: 'November Content Plan',
        year: 2026,
        month: 11,
        status,
        createdBy: 301,
        brand,
    };
}

function matchesAccess(brandData, accessWhere) {
    if (!accessWhere) return true;

    if (accessWhere.clientId !== undefined) {
        return brandData.clientId === accessWhere.clientId;
    }

    if (accessWhere.accountManagerId !== undefined) {
        return brandData.accountManagerId === accessWhere.accountManagerId;
    }

    const memberships =
        accessWhere.team?.is?.memberships?.some;

    if (memberships?.userId !== undefined) {
        return brandData.team?.memberships?.some(
            (membership) => membership.userId === memberships.userId,
        );
    }

    return true;
}

let accessToken;

function authenticateAs(user) {
    state.user = user;

    state.session = {
        id: `session-${user.id}`,
        userId: user.id,
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    accessToken = createToken();
}

function setupTransaction() {
    mockTransaction.mockImplementation(async (callback) => {
        const tx = {
            contentPlan: {
                update: mockUpdate,
            },
            notification: {
                create: mockNotificationCreate,
            },
        };

        return callback(tx);
    });
}

describe('Content Plan Notifications Integration Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        state.plan = createPlan('DRAFT');

        authenticateAs(contentCreatorUser);

        mockFindSessionById.mockImplementation(async (sessionId) => {
            return state.session?.id === sessionId
                ? state.session
                : null;
        });

        mockFindUserById.mockImplementation(async (userId) => {
            return state.user?.id === userId
                ? state.user
                : null;
        });

        mockFindAccessibleById.mockImplementation(async (id, accessWhere) => {
            if (
                state.plan?.id === Number(id) &&
                matchesAccess(state.plan.brand, accessWhere)
            ) {
                return state.plan;
            }

            return null;
        });

        mockFindById.mockImplementation(async (id) => {
            return state.plan?.id === Number(id)
                ? state.plan
                : null;
        });

        mockFindAccessibleBrandById.mockImplementation(
            async (id, accessWhere) => {
                if (
                    state.plan?.brandId !== Number(id) ||
                    !matchesAccess(state.plan.brand, accessWhere)
                ) {
                    return null;
                }

                return {
                    id: brand.id,
                    accountManagerId: brand.accountManagerId,
                    teamId: brand.teamId,
                    team: brand.team,
                };
            },
        );

        mockUpdate.mockImplementation(async (id, data) => {
            state.plan = {
                ...state.plan,
                status: data.status,
            };

            return state.plan;
        });

        mockNotificationCreate.mockImplementation(async (data) => ({
            id: 1,
            ...data,
            isRead: false,
            readAt: null,
            createdAt: new Date(),
        }));

        setupTransaction();
    });

    describe('Submitting Content Plan for Review', () => {
        it('notifies Client and Account Manager when submitted', async () => {
            const response = await request(app)
                .patch('/api/content-plans/1001/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'IN_REVIEW' });

            expect(response.status).toBe(200);

            expect(mockTransaction).toHaveBeenCalledTimes(1);
            expect(mockUpdate).toHaveBeenCalledTimes(1);
            expect(mockNotificationCreate).toHaveBeenCalledTimes(2);

            const recipients = mockNotificationCreate.mock.calls
                .map(([data]) => data.recipientId)
                .sort((a, b) => a - b);

            expect(recipients).toEqual([101, 201]);

            expect(mockNotificationCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    recipientId: 101,
                    type: 'CONTENT_PLAN_SUBMITTED',
                }),
                expect.any(Object),
            );

            expect(mockNotificationCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    recipientId: 201,
                    type: 'CONTENT_PLAN_SUBMITTED',
                }),
                expect.any(Object),
            );
        });

        it('notifies Client and Account Manager when resubmitted', async () => {
            state.plan = createPlan('NEEDS_CHANGES');

            const response = await request(app)
                .patch('/api/content-plans/1001/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'IN_REVIEW' });

            expect(response.status).toBe(200);
            expect(mockNotificationCreate).toHaveBeenCalledTimes(2);

            const recipients = mockNotificationCreate.mock.calls
                .map(([data]) => data.recipientId)
                .sort((a, b) => a - b);

            expect(recipients).toEqual([101, 201]);
        });
    });

    describe('Content Plan Review Decisions', () => {
        beforeEach(() => {
            authenticateAs(accountManagerUser);
            state.plan = createPlan('IN_REVIEW');
        });

        it('notifies Client when Content Plan is approved', async () => {
            const response = await request(app)
                .patch('/api/content-plans/1001/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'APPROVED' });

            expect(response.status).toBe(200);

            expect(mockNotificationCreate).toHaveBeenCalledTimes(1);

            expect(mockNotificationCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    recipientId: 101,
                    type: 'CONTENT_PLAN_APPROVED',
                    title: 'Content Plan Approved',
                }),
                expect.any(Object),
            );
        });

        it('notifies Client when changes are requested', async () => {
            const response = await request(app)
                .patch('/api/content-plans/1001/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'NEEDS_CHANGES' });

            expect(response.status).toBe(200);

            expect(mockNotificationCreate).toHaveBeenCalledTimes(1);

            expect(mockNotificationCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    recipientId: 101,
                    type: 'CONTENT_PLAN_NEEDS_CHANGES',
                    title: 'Content Plan Needs Changes',
                }),
                expect.any(Object),
            );
        });
    });

    describe('Authorization and Validation', () => {
        it('does not create notifications for invalid status transitions', async () => {
            authenticateAs(accountManagerUser);
            state.plan = createPlan('APPROVED');

            const response = await request(app)
                .patch('/api/content-plans/1001/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'IN_REVIEW' });

            expect(response.status).toBe(400);
            expect(mockNotificationCreate).not.toHaveBeenCalled();
            expect(mockTransaction).not.toHaveBeenCalled();
        });

        it('prevents Client from changing Content Plan status', async () => {
            authenticateAs(clientUser);
            state.plan = createPlan('DRAFT');

            const response = await request(app)
                .patch('/api/content-plans/1001/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'IN_REVIEW' });

            expect(response.status).toBe(403);
            expect(mockNotificationCreate).not.toHaveBeenCalled();
            expect(mockTransaction).not.toHaveBeenCalled();
        });
    });

    describe('Transaction Failure', () => {
        it('returns an error when notification creation fails', async () => {
            authenticateAs(accountManagerUser);
            state.plan = createPlan('IN_REVIEW');

            mockNotificationCreate.mockRejectedValueOnce(
                new Error('Notification creation failed'),
            );

            const response = await request(app)
                .patch('/api/content-plans/1001/status')
                .set('Authorization', `Bearer ${accessToken}`)
                .send({ status: 'APPROVED' });

            expect(response.status).toBeGreaterThanOrEqual(500);
            expect(mockUpdate).toHaveBeenCalledTimes(1);
            expect(mockNotificationCreate).toHaveBeenCalledTimes(1);
        });
    });
});
