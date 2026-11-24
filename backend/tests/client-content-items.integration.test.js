
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Shared state between the test and mocked models.
const state = vi.hoisted(() => ({
    user: null,
    session: null,
    contentItems: [],
    listCalls: [],
    findByIdCalls: [],
}));

// Mock Authentication Model.
// Keep the real authenticate middleware.
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

// Mock Content Items Model.
vi.mock('../src/modules/content-items/content-items.model.js', () => ({
    ContentItemsModel: {
        list: async (filters) => {
            state.listCalls.push(filters);

            return state.contentItems
                .filter((item) => {
                    if (
                        filters?.clientId !== undefined &&
                        item.contentPlan.brand.clientId !== filters.clientId
                    ) {
                        return false;
                    }

                    if (
                        filters?.contentPlanId !== undefined &&
                        item.contentPlanId !== filters.contentPlanId
                    ) {
                        return false;
                    }

                    if (
                        filters?.campaignId !== undefined &&
                        item.campaignId !== filters.campaignId
                    ) {
                        return false;
                    }

                    if (
                        filters?.type !== undefined &&
                        item.type !== filters.type
                    ) {
                        return false;
                    }

                    return true;
                })
                .map(({ contentPlan, ...item }) => ({
                    ...item,
                    contentPlan: {
                        id: contentPlan.id,
                        title: contentPlan.title,
                        brandId: contentPlan.brandId,
                        platformAccountId: contentPlan.platformAccountId,
                        year: contentPlan.year,
                        month: contentPlan.month,
                    },
                }));
        },

        findById: async (id, clientId) => {
            state.findByIdCalls.push({ id, clientId });

            const item = state.contentItems.find((item) => {
                const matchesId = item.id === id;

                const matchesClient =
                    clientId === undefined ||
                    item.contentPlan.brand.clientId === clientId;

                return matchesId && matchesClient;
            });

            if (!item) {
                return null;
            }

            const { contentPlan, ...itemData } = item;

            return {
                ...itemData,
                contentPlan: {
                    id: contentPlan.id,
                    title: contentPlan.title,
                    brandId: contentPlan.brandId,
                    platformAccountId: contentPlan.platformAccountId,
                    year: contentPlan.year,
                    month: contentPlan.month,
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

describe('Client Content Items Integration Tests', () => {
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

        state.contentItems = [
            // Content Item belonging to the authenticated client.
            {
                id: 1,
                contentPlanId: 11,
                campaignId: 21,
                createdBy: 301,
                scheduledDate: new Date('2026-11-20T10:00:00.000Z'),
                type: 'POST',
                title: 'Own Client Content Item',
                reference: null,
                toneOfVoice: 'Friendly',
                caption: 'Our November post',
                notes: null,
                createdAt: new Date(),
                updatedAt: new Date(),

                contentPlan: {
                    id: 11,
                    title: 'Own Client Content Plan',
                    brandId: 201,
                    platformAccountId: 401,
                    year: 2026,
                    month: 11,

                    brand: {
                        id: 201,
                        clientId: 101,
                    },
                },

                campaign: null,

                creator: {
                    id: 301,
                    fullName: 'Content Creator',
                    email: 'creator@test.com',
                },
            },

            // Another Content Item belonging to the same client.
            {
                id: 2,
                contentPlanId: 11,
                campaignId: null,
                createdBy: 301,
                scheduledDate: new Date('2026-11-25T10:00:00.000Z'),
                type: 'STORY',
                title: 'Own Client Story',
                reference: null,
                toneOfVoice: null,
                caption: 'Our November story',
                notes: null,
                createdAt: new Date(),
                updatedAt: new Date(),

                contentPlan: {
                    id: 11,
                    title: 'Own Client Content Plan',
                    brandId: 201,
                    platformAccountId: 401,
                    year: 2026,
                    month: 11,

                    brand: {
                        id: 201,
                        clientId: 101,
                    },
                },

                campaign: null,

                creator: {
                    id: 301,
                    fullName: 'Content Creator',
                    email: 'creator@test.com',
                },
            },

            // Content Item belonging to another client.
            {
                id: 3,
                contentPlanId: 12,
                campaignId: 22,
                createdBy: 302,
                scheduledDate: new Date('2026-11-22T10:00:00.000Z'),
                type: 'POST',
                title: 'Another Client Content Item',
                reference: null,
                toneOfVoice: null,
                caption: 'Another client post',
                notes: null,
                createdAt: new Date(),
                updatedAt: new Date(),

                contentPlan: {
                    id: 12,
                    title: 'Another Client Content Plan',
                    brandId: 202,
                    platformAccountId: 402,
                    year: 2026,
                    month: 11,

                    brand: {
                        id: 202,
                        clientId: 102,
                    },
                },

                campaign: null,

                creator: {
                    id: 302,
                    fullName: 'Another Creator',
                    email: 'another-creator@test.com',
                },
            },
        ];

        state.listCalls = [];
        state.findByIdCalls = [];

        accessToken = createClientToken();
    });

    // Test 1: Client can retrieve their own Content Items only.
    it('allows a client to retrieve only their own Content Items', async () => {
        const response = await request(app)
            .get('/api/content-items')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.total).toBe(2);
        expect(response.body.data.items).toHaveLength(2);

        expect(
            response.body.data.items.map((item) => item.id),
        ).toEqual([1, 2]);

        expect(
            response.body.data.items.some(
                (item) => item.id === 3,
            ),
        ).toBe(false);

        // Verify that the service restricted the query to this client.
        expect(state.listCalls).toHaveLength(1);

        expect(state.listCalls[0]).toMatchObject({
            clientId: 101,
        });
    });

    // Test 2: Client cannot retrieve another client's Content Items
    // by filtering with another client's Content Plan ID.
    it('prevents a client from retrieving another client Content Items through Content Plan filter', async () => {
        const response = await request(app)
            .get('/api/content-items?contentPlanId=12')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.total).toBe(0);
        expect(response.body.data.items).toHaveLength(0);

        expect(state.listCalls).toHaveLength(1);

        expect(state.listCalls[0]).toMatchObject({
            contentPlanId: 12,
            clientId: 101,
        });
    });

    // Test 3: Client can retrieve their own Content Item by ID.
    it('allows a client to retrieve their own Content Item by ID', async () => {
        const response = await request(app)
            .get('/api/content-items/1')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data).toMatchObject({
            id: 1,
            contentPlanId: 11,
            title: 'Own Client Content Item',
            type: 'POST',
        });

        expect(state.findByIdCalls).toHaveLength(1);

        expect(state.findByIdCalls[0]).toEqual({
            id: 1,
            clientId: 101,
        });
    });

    // Test 4: Client cannot retrieve another client's Content Item by ID.
    it('prevents a client from retrieving another client Content Item by ID', async () => {
        const response = await request(app)
            .get('/api/content-items/3')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(404);

        expect(state.findByIdCalls).toHaveLength(1);

        expect(state.findByIdCalls[0]).toEqual({
            id: 3,
            clientId: 101,
        });
    });

    // Test 5: Client receives an empty list when their Content Plan has no Items.
    it('returns an empty list when the client Content Plan has no Content Items', async () => {
        const response = await request(app)
            .get('/api/content-items?contentPlanId=999')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);

        expect(response.body.data.total).toBe(0);
        expect(response.body.data.items).toHaveLength(0);
    });
});
