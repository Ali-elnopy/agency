
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Shared state between the test and mocked models.
const state = vi.hoisted(() => ({
    user: null,
    session: null,
    contentPlans: [],
    listCalls: [],
}));

// Mock Authentication Model.
// We keep the real authenticate middleware.
vi.mock('../src/modules/auth/auth.model.js', () => ({
    AuthModel: {
        findSessionById: async (sessionId) => {
            if (state.session?.id === sessionId) {
                return state.session;
            }

            return null;
        },

        findUserById: async (userId) => {
            if (state.user?.id === userId) {
                return state.user;
            }

            return null;
        },
    },
}));

// Mock Content Plans Model.
vi.mock('../src/modules/content-plans/content-plans.model.js', () => ({
    ContentPlansModel: {
        list: async (filters) => {
            state.listCalls.push(filters);

            return state.contentPlans.filter((plan) => {
                const clientId = filters?.accessWhere?.clientId;

                if (
                    clientId !== undefined &&
                    plan.brand?.clientId !== clientId
                ) {
                    return false;
                }

                return true;
            });
        },

        findAccessibleById: async (id, accessWhere) => {
            return state.contentPlans.find((plan) => {
                return (
                    plan.id === Number(id) &&
                    plan.brand?.clientId === accessWhere?.clientId
                );
            }) || null;
        },

        findAccessibleBrandById: async (id, accessWhere) => {
            const plan = state.contentPlans.find((item) => {
                return (
                    item.brandId === Number(id) &&
                    item.brand?.clientId === accessWhere?.clientId
                );
            });

            if (!plan) {
                return null;
            }

            return {
                id: plan.brand.id,
                accountManagerId: 201,
                teamId: null,
                team: {
                    memberships: [],
                },
            };
        },
    },
}));

// Configure the secret used by the real authentication middleware.
process.env.JWT_SECRET ||= 'integration-test-secret';

// Import app after registering the mocks.
const { default: app } = await import('../src/app.js');

const createClientToken = () => {
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
};

describe('Client Content Plans Integration Tests', () => {
    let accessToken;

    beforeEach(() => {
        state.user = {
            id: 101,
            fullName: 'Test Client',
            email: 'client@test.com',
            isActive: true,
            role: {
                id: 4,
                name: 'CLIENT',
            },
        };

        state.session = {
            id: 'session-client-101',
            userId: 101,
            revokedAt: null,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        };

        state.contentPlans = [
            // Content Plan belonging to the authenticated client.
            {
                id: 1,
                brandId: 201,
                platformAccountId: 301,
                title: 'Own Client Content Plan',
                year: 2026,
                month: 11,
                monthlyGoals: 'Increase engagement',
                notes: 'November content plan',
                status: 'DRAFT',
                createdBy: 101,
                createdAt: new Date(),
                updatedAt: new Date(),
                brand: {
                    id: 201,
                    name: 'Client Own Brand',
                    clientId: 101,
                },
                platformAccount: {
                    id: 301,
                    platform: 'Instagram',
                    accountName: 'Own Brand Account',
                    accountUrl: 'https://instagram.com/ownbrand',
                    isActive: true,
                },
                creator: {
                    id: 101,
                    fullName: 'Test Client',
                    email: 'client@test.com',
                },
            },

            // Content Plan belonging to another client.
            {
                id: 2,
                brandId: 202,
                platformAccountId: 302,
                title: 'Another Client Content Plan',
                year: 2026,
                month: 11,
                monthlyGoals: 'Increase sales',
                notes: 'Another client plan',
                status: 'DRAFT',
                createdBy: 102,
                createdAt: new Date(),
                updatedAt: new Date(),
                brand: {
                    id: 202,
                    name: 'Another Client Brand',
                    clientId: 102,
                },
                platformAccount: {
                    id: 302,
                    platform: 'Facebook',
                    accountName: 'Another Brand Account',
                    accountUrl: 'https://facebook.com/anotherbrand',
                    isActive: true,
                },
                creator: {
                    id: 102,
                    fullName: 'Another Client',
                    email: 'another@test.com',
                },
            },
        ];

        state.listCalls = [];

        accessToken = createClientToken();
    });

    // Test 1: Client can retrieve their own Content Plans only.
    it('allows a client to retrieve only their own Content Plans', async () => {
        const response = await request(app)
            .get('/api/content-plans')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data.total).toBe(1);

        expect(response.body.data.plans).toHaveLength(1);

        expect(response.body.data.plans[0]).toMatchObject({
            id: 1,
            brandId: 201,
            title: 'Own Client Content Plan',
            status: 'DRAFT',
        });

        // Verify that the service restricted the query to this client.
        expect(state.listCalls).toHaveLength(1);

        expect(state.listCalls[0].accessWhere).toMatchObject({
            clientId: 101,
        });
    });

    // Test 2: Client can retrieve their own Content Plan by ID.
    it('allows a client to retrieve their own Content Plan by ID', async () => {
        const response = await request(app)
            .get('/api/content-plans/1')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toMatchObject({
            id: 1,
            brandId: 201,
            title: 'Own Client Content Plan',
            status: 'DRAFT',
        });
    });

    // Test 3: Client cannot retrieve another client's Content Plan.
    it('prevents a client from retrieving another client Content Plan', async () => {
        const response = await request(app)
            .get('/api/content-plans/2')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(404);
    });

    // Test 4: Client cannot create a Content Plan.
    it('prevents a client from creating a Content Plan', async () => {
        const response = await request(app)
            .post('/api/content-plans')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                brandId: 201,
                platformAccountId: 301,
                title: 'New Content Plan',
                year: 2026,
                month: 12,
                monthlyGoals: 'Increase followers',
                notes: 'December plan',
            });

        expect(response.status).toBe(403);
    });

    // Test 5: Client cannot update their own Content Plan.
    it('prevents a client from updating their own Content Plan', async () => {
        const response = await request(app)
            .patch('/api/content-plans/1')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                title: 'Updated Content Plan',
            });

        expect(response.status).toBe(403);
    });

    // Test 6: Client cannot change their Content Plan status.
    it('prevents a client from changing their Content Plan status', async () => {
        const response = await request(app)
            .patch('/api/content-plans/1/status')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                status: 'IN_REVIEW',
            });

        expect(response.status).toBe(403);
    });

    // Test 7: Client cannot delete their own Content Plan.
    it('prevents a client from deleting their own Content Plan', async () => {
        const response = await request(app)
            .delete('/api/content-plans/1')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(403);
    });
});
