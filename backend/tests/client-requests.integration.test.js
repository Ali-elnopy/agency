
import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const state = vi.hoisted(() => ({
    requests: new Map(),
    brands: new Map(),
    users: new Map(),
    memberships: new Set(),
    nextRequestId: 1,
    nextTaskId: 100,
    lastListWhere: null,
}));

vi.mock('../src/middlewares/auth.js', () => ({
    authenticate: (req, res, next) => {
        const id = Number(req.headers['x-test-user-id']);
        const role = req.headers['x-test-user-role'];

        if (!Number.isSafeInteger(id) || id <= 0 || !role) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        req.user = {
            id,
            role: { name: role },
        };

        next();
    },
}));

vi.mock('../src/modules/client-requests/client-requests.model.js', () => ({
    ClientRequestsModel: {
        findBrandByClientId: vi.fn(async (clientId) => {
            return (
                [...state.brands.values()].find(
                    (brand) => brand.clientId === clientId,
                ) ?? null
            );
        }),

        findById: vi.fn(async (id) => {
            const clientRequest = state.requests.get(id);

            if (!clientRequest) {
                return null;
            }

            return {
                ...clientRequest,
                brand: state.brands.get(clientRequest.brandId) ?? null,
            };
        }),

        list: vi.fn(async (where) => {
            state.lastListWhere = where;
            return [...state.requests.values()];
        }),

        create: vi.fn(async (data) => {
            const id = state.nextRequestId++;

            const clientRequest = {
                id,
                ...data,
                employeeId: null,
                rejectionReason: null,
                relatedTaskId: null,
                resolvedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            state.requests.set(id, clientRequest);

            return {
                ...clientRequest,
                brand: state.brands.get(data.brandId) ?? null,
            };
        }),

        findTeamMembership: vi.fn(async (teamId, userId) => {
            return state.memberships.has(`${teamId}:${userId}`)
                ? { teamId, userId }
                : null;
        }),

        findUserById: vi.fn(async (id) => {
            return state.users.get(id) ?? null;
        }),

        updatePending: vi.fn(async (id, data) => {
            const clientRequest = state.requests.get(id);

            if (!clientRequest || clientRequest.status !== 'PENDING') {
                return { count: 0 };
            }

            state.requests.set(id, {
                ...clientRequest,
                ...data,
                updatedAt: new Date(),
            });

            return { count: 1 };
        }),
    },
}));

vi.mock('../src/config/prisma.js', () => {
    const tx = {
        clientRequest: {
            update: vi.fn(async ({ where, data }) => {
                const clientRequest = state.requests.get(where.id);

                if (!clientRequest) {
                    throw new Error('Client request not found');
                }

                const updated = {
                    ...clientRequest,
                    ...data,
                    updatedAt: new Date(),
                };

                state.requests.set(where.id, updated);

                return updated;
            }),
        },

        task: {
            create: vi.fn(async ({ data }) => ({
                id: state.nextTaskId++,
                ...data,
            })),
        },
    };

    return {
        prisma: {
            $transaction: vi.fn(async (callback) => callback(tx)),
        },
    };
});

vi.mock('../src/modules/tasks/tasks.service.js', () => ({
    TasksService: {
        createDirectTask: vi.fn(async (input, currentUser, db) => {
            const taskData = {
                contentItemId: null,
                type: 'DIRECT',
                title: input.title,
                description: input.description,
                assignedTo: input.assignedTo,
                createdBy: currentUser.id,
                status: 'TODO',
                priority: input.priority ?? 'MEDIUM',
                plannedDeadline: new Date(input.plannedDeadline),
                effectiveDeadline: new Date(input.plannedDeadline),
            };

            // Simulate creating the task through the transaction client.
            if (db?.task?.create) {
                return db.task.create({
                    data: taskData,
                });
            }

            return {
                id: state.nextTaskId++,
                ...taskData,
            };
        }),
    },
}));

process.env.JWT_SECRET =
    'test-secret-test-secret-test-secret-123-at-least-32-chars';

const { default: app } = await import('../src/app.js');

const { TasksService } = await import(
    '../src/modules/tasks/tasks.service.js'
);

const API = '/api/v1/client-requests';

function auth(id, role) {
    return {
        'x-test-user-id': String(id),
        'x-test-user-role': role,
    };
}

function addBrand({
    id = 1,
    clientId = 10,
    accountManagerId = 20,
    teamId = 30,
} = {}) {
    const brand = {
        id,
        clientId,
        accountManagerId,
        teamId,
    };

    state.brands.set(id, brand);

    return brand;
}

function addUser({
    id,
    role,
    isActive = true,
    fullName = `User ${id}`,
}) {
    const user = {
        id,
        fullName,
        email: `user${id}@test.com`,
        isActive,
        role: { name: role },
    };

    state.users.set(id, user);

    return user;
}

function addRequest({
    id = 1,
    brandId = 1,
    clientId = 10,
    accountManagerId = 20,
    employeeId = null,
    type = 'EXTRA_CONTENT',
    description = 'Please create additional content',
    status = 'PENDING',
    rejectionReason = null,
    relatedTaskId = null,
} = {}) {
    const clientRequest = {
        id,
        brandId,
        clientId,
        accountManagerId,
        employeeId,
        type,
        description,
        status,
        rejectionReason,
        relatedTaskId,
        resolvedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    state.requests.set(id, clientRequest);

    return clientRequest;
}

function futureDate() {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

function setupDefaultData() {
    addUser({ id: 1, role: 'ADMIN' });

    addUser({ id: 20, role: 'ACCOUNT_MANAGER' });
    addUser({ id: 21, role: 'ACCOUNT_MANAGER' });

    addUser({ id: 30, role: 'EMPLOYEE' });
    addUser({ id: 31, role: 'EMPLOYEE' });
    addUser({ id: 32, role: 'EMPLOYEE', isActive: false });

    addUser({ id: 10, role: 'CLIENT' });
    addUser({ id: 11, role: 'CLIENT' });

    addBrand({
        id: 1,
        clientId: 10,
        accountManagerId: 20,
        teamId: 100,
    });

    addBrand({
        id: 2,
        clientId: 11,
        accountManagerId: 21,
        teamId: 200,
    });

    // Employee 30 belongs to Team 100.
    state.memberships.add('100:30');

    // Employee 31 belongs to Team 200 only.
    state.memberships.add('200:31');

    addRequest({
        id: 1,
        brandId: 1,
        clientId: 10,
        accountManagerId: 20,
    });

    addRequest({
        id: 2,
        brandId: 2,
        clientId: 11,
        accountManagerId: 21,
        description: 'Request belonging to another brand',
    });
}

beforeEach(() => {
    state.requests.clear();
    state.brands.clear();
    state.users.clear();
    state.memberships.clear();

    state.nextRequestId = 10;
    state.nextTaskId = 100;
    state.lastListWhere = null;

    vi.clearAllMocks();

    setupDefaultData();
});

describe('Client Requests API', () => {
    describe('POST /', () => {
        it('allows a client to create a request using only type and description', async () => {
            const response = await request(app)
                .post(API)
                .set(auth(10, 'CLIENT'))
                .send({
                    type: 'EXTRA_CONTENT',
                    description: 'We need additional social media content',
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);

            expect(response.body.data).toMatchObject({
                brandId: 1,
                clientId: 10,
                accountManagerId: 20,
                type: 'EXTRA_CONTENT',
                description: 'We need additional social media content',
                status: 'PENDING',
            });

            expect(response.body.data.id).toBe(10);
        });

        it('does not trust brand, client, or account manager IDs from the body', async () => {
            const response = await request(app)
                .post(API)
                .set(auth(10, 'CLIENT'))
                .send({
                    type: 'NEW_IDEA',
                    description: 'A new idea',
                    brandId: 2,
                    clientId: 11,
                    accountManagerId: 21,
                });

            expect(response.status).toBe(400);
        });

        it('rejects invalid request types', async () => {
            const response = await request(app)
                .post(API)
                .set(auth(10, 'CLIENT'))
                .send({
                    type: 'INVALID_TYPE',
                    description: 'Some description',
                });

            expect(response.status).toBe(400);
        });

        it('rejects an empty description', async () => {
            const response = await request(app)
                .post(API)
                .set(auth(10, 'CLIENT'))
                .send({
                    type: 'PLAN_CHANGE',
                    description: '   ',
                });

            expect(response.status).toBe(400);
        });

        it('does not allow employees to create client requests', async () => {
            const response = await request(app)
                .post(API)
                .set(auth(30, 'EMPLOYEE'))
                .send({
                    type: 'NEW_IDEA',
                    description: 'Some description',
                });

            expect(response.status).toBe(403);
        });

        it('rejects creation when the client has no brand', async () => {
            state.brands.delete(1);

            const response = await request(app)
                .post(API)
                .set(auth(10, 'CLIENT'))
                .send({
                    type: 'NEW_IDEA',
                    description: 'Some description',
                });

            expect(response.status).toBe(404);
        });

        it('rejects creation when the brand has no assigned account manager', async () => {
            state.brands.set(1, {
                ...state.brands.get(1),
                accountManagerId: null,
            });

            const response = await request(app)
                .post(API)
                .set(auth(10, 'CLIENT'))
                .send({
                    type: 'NEW_IDEA',
                    description: 'Some description',
                });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /', () => {
        it('lists requests for the current client only', async () => {
            const response = await request(app)
                .get(API)
                .set(auth(10, 'CLIENT'));

            expect(response.status).toBe(200);

            expect(state.lastListWhere).toEqual({
                AND: [{ clientId: 10 }],
            });
        });

        it('lists requests for brands assigned to the current account manager', async () => {
            const response = await request(app)
                .get(API)
                .set(auth(20, 'ACCOUNT_MANAGER'));

            expect(response.status).toBe(200);

            expect(state.lastListWhere).toEqual({
                AND: [
                    {
                        brand: {
                            accountManagerId: 20,
                        },
                    },
                ],
            });
        });

        it('allows admins to list all requests', async () => {
            const response = await request(app)
                .get(API)
                .set(auth(1, 'ADMIN'));

            expect(response.status).toBe(200);
            expect(state.lastListWhere).toEqual({});
        });

        it('applies status and type filters without removing access restrictions', async () => {
            const response = await request(app)
                .get(API)
                .query({
                    status: 'PENDING',
                    type: 'EXTRA_CONTENT',
                })
                .set(auth(20, 'ACCOUNT_MANAGER'));

            expect(response.status).toBe(200);

            expect(state.lastListWhere).toEqual({
                AND: [
                    {
                        brand: {
                            accountManagerId: 20,
                        },
                    },
                    {
                        status: 'PENDING',
                    },
                    {
                        type: 'EXTRA_CONTENT',
                    },
                ],
            });
        });

        it('does not allow employees to list client requests', async () => {
            const response = await request(app)
                .get(API)
                .set(auth(30, 'EMPLOYEE'));

            expect(response.status).toBe(403);
        });

        it('rejects invalid list filters', async () => {
            const response = await request(app)
                .get(API)
                .query({ status: 'INVALID_STATUS' })
                .set(auth(20, 'ACCOUNT_MANAGER'));

            expect(response.status).toBe(400);
        });
    });

    describe('GET /:id', () => {
        it('allows a client to view their own request', async () => {
            const response = await request(app)
                .get(`${API}/1`)
                .set(auth(10, 'CLIENT'));

            expect(response.status).toBe(200);
            expect(response.body.data.id).toBe(1);
        });

        it('prevents a client from viewing another client request', async () => {
            const response = await request(app)
                .get(`${API}/2`)
                .set(auth(10, 'CLIENT'));

            expect(response.status).toBe(403);
        });

        it('allows an account manager to view requests for assigned brands', async () => {
            const response = await request(app)
                .get(`${API}/1`)
                .set(auth(20, 'ACCOUNT_MANAGER'));

            expect(response.status).toBe(200);
        });

        it('prevents an account manager from viewing another manager request', async () => {
            const response = await request(app)
                .get(`${API}/2`)
                .set(auth(20, 'ACCOUNT_MANAGER'));

            expect(response.status).toBe(403);
        });

        it('allows an admin to view any request', async () => {
            const response = await request(app)
                .get(`${API}/2`)
                .set(auth(1, 'ADMIN'));

            expect(response.status).toBe(200);
        });

        it('returns 404 for a non-existing request', async () => {
            const response = await request(app)
                .get(`${API}/999`)
                .set(auth(1, 'ADMIN'));

            expect(response.status).toBe(404);
        });
    });

    describe('PATCH /:id/accept', () => {
        it('allows the assigned account manager to accept a request and create a linked DIRECT task', async () => {
            const deadline = futureDate();

            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: deadline,
                    priority: 'HIGH',
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);

            expect(response.body.data.request).toMatchObject({
                id: 1,
                status: 'ACCEPTED',
                employeeId: 30,
            });

            expect(response.body.data.request.relatedTaskId).toBe(
                response.body.data.task.id,
            );

            expect(response.body.data.task).toMatchObject({
                type: 'DIRECT',
                title: 'Client Request: EXTRA_CONTENT',
                description: 'Please create additional content',
                assignedTo: 30,
                createdBy: 20,
                status: 'TODO',
                priority: 'HIGH',
            });

            expect(TasksService.createDirectTask).toHaveBeenCalledTimes(1);

            const taskCall = TasksService.createDirectTask.mock.calls[0];

            expect(taskCall[0]).toMatchObject({
                title: 'Client Request: EXTRA_CONTENT',
                description: 'Please create additional content',
                assignedTo: 30,
                priority: 'HIGH',
            });

            expect(taskCall[1]).toMatchObject({
                id: 20,
            });

            // The third argument must be the transaction client.
            expect(taskCall[2]).toBeDefined();
            expect(taskCall[2].clientRequest).toBeDefined();
        });

        it('allows an admin to accept a request', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(1, 'ADMIN'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(200);
            expect(response.body.data.request.status).toBe('ACCEPTED');
        });

        it('does not allow an account manager to accept another manager request', async () => {
            const response = await request(app)
                .patch(`${API}/2/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 31,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(403);
            expect(TasksService.createDirectTask).not.toHaveBeenCalled();
        });

        it('does not allow clients to accept requests', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(10, 'CLIENT'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(403);
        });

        it('does not allow employees to accept requests', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(30, 'EMPLOYEE'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(403);
        });

        it('rejects an inactive employee', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 32,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(400);
            expect(TasksService.createDirectTask).not.toHaveBeenCalled();
        });

        it('rejects an employee who is not a member of the brand team', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 31,
                    plannedDeadline: futureDate(),
                });

            // Employee 31 belongs to team 200, not team 100.
            expect(response.status).toBe(400);
            expect(TasksService.createDirectTask).not.toHaveBeenCalled();
        });

        it('rejects a user who is not an EMPLOYEE', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 20,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(400);
        });

        it('rejects a non-existing employee', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 999,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(404);
        });

        it('rejects an invalid planned deadline', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: 'not-a-date',
                });

            expect(response.status).toBe(400);
        });

        it('rejects a deadline in the past', async () => {
            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: '2020-01-01T10:00:00.000Z',
                });

            expect(response.status).toBe(400);
        });

        it('rejects accepting a request that has already been processed', async () => {
            state.requests.set(1, {
                ...state.requests.get(1),
                status: 'REJECTED',
            });

            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(409);
            expect(TasksService.createDirectTask).not.toHaveBeenCalled();
        });

        it('rejects accepting when the brand has no assigned team', async () => {
            state.brands.set(1, {
                ...state.brands.get(1),
                teamId: null,
            });

            const response = await request(app)
                .patch(`${API}/1/accept`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    assignedTo: 30,
                    plannedDeadline: futureDate(),
                });

            expect(response.status).toBe(400);
            expect(TasksService.createDirectTask).not.toHaveBeenCalled();
        });
    });

    describe('PATCH /:id/reject', () => {
        it('allows the assigned account manager to reject a pending request with a reason', async () => {
            const response = await request(app)
                .patch(`${API}/1/reject`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    reason: 'The requested work is outside the current agreement',
                });

            expect(response.status).toBe(200);

            expect(response.body.data).toMatchObject({
                id: 1,
                status: 'REJECTED',
                rejectionReason:
                    'The requested work is outside the current agreement',
            });

            expect(response.body.data.resolvedAt).toBeTruthy();
            expect(TasksService.createDirectTask).not.toHaveBeenCalled();
        });

        it('allows an admin to reject a request', async () => {
            const response = await request(app)
                .patch(`${API}/1/reject`)
                .set(auth(1, 'ADMIN'))
                .send({
                    reason: 'Not feasible',
                });

            expect(response.status).toBe(200);
            expect(response.body.data.status).toBe('REJECTED');
        });

        it('does not allow an account manager to reject another manager request', async () => {
            const response = await request(app)
                .patch(`${API}/2/reject`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    reason: 'Not feasible',
                });

            expect(response.status).toBe(403);
        });

        it('does not allow clients to reject requests', async () => {
            const response = await request(app)
                .patch(`${API}/1/reject`)
                .set(auth(10, 'CLIENT'))
                .send({
                    reason: 'Not feasible',
                });

            expect(response.status).toBe(403);
        });

        it('does not allow employees to reject requests', async () => {
            const response = await request(app)
                .patch(`${API}/1/reject`)
                .set(auth(30, 'EMPLOYEE'))
                .send({
                    reason: 'Not feasible',
                });

            expect(response.status).toBe(403);
        });

        it('requires a rejection reason', async () => {
            const response = await request(app)
                .patch(`${API}/1/reject`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({});

            expect(response.status).toBe(400);
        });

        it('rejects an empty rejection reason', async () => {
            const response = await request(app)
                .patch(`${API}/1/reject`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    reason: '   ',
                });

            expect(response.status).toBe(400);
        });

        it('rejects rejecting a request that has already been processed', async () => {
            state.requests.set(1, {
                ...state.requests.get(1),
                status: 'ACCEPTED',
            });

            const response = await request(app)
                .patch(`${API}/1/reject`)
                .set(auth(20, 'ACCOUNT_MANAGER'))
                .send({
                    reason: 'Not feasible',
                });

            expect(response.status).toBe(409);
        });
    });
});
