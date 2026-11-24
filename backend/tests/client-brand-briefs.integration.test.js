
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Shared state between the test and mocked models.
const state = vi.hoisted(() => ({
    user: null,
    session: null,
    briefs: [],
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

// Mock Brand Briefs Model.
// Mock Brand Briefs Model.
vi.mock('../src/modules/brand-briefs/brand-briefs.model.js', () => ({
    BrandBriefsModel: {
        list: async (filters) => {
            state.listCalls.push(filters);

            return state.briefs.filter((brief) => {
                if (
                    filters?.clientId &&
                    brief.onboarding?.brand?.clientId !== filters.clientId
                ) {
                    return false;
                }

                return true;
            });
        },

        findById: async (id) => {
            return state.briefs.find(
                (brief) => brief.id === Number(id),
            ) || null;
        },

        findBrandForGeneration: async (brandId) => {
            const brief = state.briefs.find(
                (item) => item.onboarding?.brand?.id === brandId,
            );

            if (!brief) {
                return null;
            }

            return {
                ...brief.onboarding.brand,
                onboarding: {
                    id: brief.onboardingId,
                    status: 'SUBMITTED',
                    mainCategory: 'Technology',
                    activityType: 'B2B',
                    templateVersion: 1,
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

describe('Client Brand Briefs Integration Tests', () => {
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

        state.briefs = [
            // Brief belonging to the authenticated client.
            {
                id: 1,
                onboardingId: 10,
                version: 1,
                status: 'GENERATED',
                content: {
                    objectives: ['Increase sales'],
                    targetAudience: 'Young adults',
                    toneOfVoice: 'Friendly',
                },
                generatedAt: new Date(),
                createdAt: new Date(),
                modelName: 'gemini-test',
                generatedBy: {
                    fullName: 'Account Manager',
                },
                onboarding: {
                    brandId: 201,
                    brand: {
                        id: 201,
                        name: 'Client Own Brand',
                        clientId: 101,
                    },
                },
            },

            // Brief belonging to another client.
            {
                id: 2,
                onboardingId: 20,
                version: 1,
                status: 'GENERATED',
                content: {
                    objectives: ['Increase engagement'],
                    targetAudience: 'Professionals',
                    toneOfVoice: 'Professional',
                },
                generatedAt: new Date(),
                createdAt: new Date(),
                modelName: 'gemini-test',
                generatedBy: {
                    fullName: 'Another Account Manager',
                },
                onboarding: {
                    brandId: 202,
                    brand: {
                        id: 202,
                        name: 'Another Client Brand',
                        clientId: 102,
                    },
                },
            },
        ];

        state.listCalls = [];

        accessToken = createClientToken();
    });

    // Test 1: Client can retrieve their own Brand Briefs.
    it('allows a client to retrieve their Brand Briefs', async () => {
        const response = await request(app)
            .get('/api/brand-briefs')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.message).toBe(
            'Brand Briefs retrieved successfully.',
        );

        expect(response.body.data.total).toBe(1);

        expect(response.body.data.briefs).toHaveLength(1);

        expect(response.body.data.briefs[0]).toMatchObject({
            id: 'brief-1',
            serverId: 1,
            brandId: '201',
            brandName: 'Client Own Brand',
            status: 'draft',
        });

        // Verify that the service restricted the query to this client.
        expect(state.listCalls).toHaveLength(1);

        expect(state.listCalls[0]).toMatchObject({
            clientId: 101,
        });
    });

    // Test 2: Client can retrieve their own Brand Brief by ID.
    it('allows a client to retrieve their own Brand Brief by ID', async () => {
        const response = await request(app)
            .get('/api/brand-briefs/1')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(200);

        expect(response.body.success).toBe(true);

        expect(response.body.data).toMatchObject({
            id: 'brief-1',
            serverId: 1,
            brandId: '201',
            brandName: 'Client Own Brand',
        });
    });

    // Test 3: Client cannot retrieve another client's Brand Brief.
    it('prevents a client from retrieving another client Brand Brief', async () => {
        const response = await request(app)
            .get('/api/brand-briefs/2')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(403);
    });

    // Test 4: Client cannot update a Brand Brief.
    it('prevents a client from updating a Brand Brief', async () => {
        const response = await request(app)
            .patch('/api/brand-briefs/1')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                status: 'NEEDS_CHANGES',
            });

        expect(response.status).toBe(403);
    });

    // Test 5: Client cannot approve a Brand Brief.
    it('prevents a client from approving a Brand Brief', async () => {
        const response = await request(app)
            .post('/api/brand-briefs/1/approve')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(403);
    });

    // Test 6: Client cannot generate a Brand Brief.
    it('prevents a client from generating a Brand Brief', async () => {
        const response = await request(app)
            .post('/api/brand-briefs/201/generate')
            .set('Authorization', `Bearer ${accessToken}`);

        expect(response.status).toBe(403);
    });
});
