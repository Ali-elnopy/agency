import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  users: new Map(),
  nextTaskId: 20,
}));

vi.mock('../auth/auth.model.js', () => ({
  AuthModel: {
    findSessionById: async (id) => ({
      id,
      userId: Number(id.replace('session-', '')),
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    }),
    findUserById: async (id) => mocks.users.get(id),
  },
}));

vi.mock('./tasks.model.js', () => ({
  TasksModel: {
    create: async (data) => ({ id: mocks.nextTaskId++, ...data }),
    list: async () => [],
    findById: async () => ({
      id: 7,
      type: 'DIRECT',
      assignedTo: 2,
      createdBy: 3,
      status: 'TODO',
      completedAt: null,
    }),
    update: async (id, data) => ({ id, ...data }),
    remove: async (id) => ({ id }),
    findUserById: async (id) => ({
      id,
      role: { name: id === 4 ? 'ACCOUNT_MANAGER' : 'EMPLOYEE' },
    }),
    findContentItemById: async () => ({
      id: 9,
      title: 'Test item',
      type: 'POST',
      scheduledDate: new Date(Date.now() + 86_400_000),
      createdBy: 2,
      contentPlan: { brand: { accountManagerId: 4 } },
    }),
    findExistingWorkflowTasks: async () => [],
    findDeadlineRule: async (_contentType, taskType) => ({
      isActive: true,
      offsetMinutes: taskType === 'REVIEW' ? 120 : 60,
    }),
  },
}));

vi.mock('../../config/prisma.js', () => ({
  prisma: {
    $transaction: async (callback) => callback({
      task: {
        create: async ({ data }) => ({ id: mocks.nextTaskId++, ...data }),
      },
    }),
  },
}));

const { default: app } = await import('../../app.js');

const roleCases = [
  { role: 'ADMIN', id: 1 },
  { role: 'ACCOUNT_MANAGER', id: 4 },
  { role: 'EMPLOYEE', id: 2 },
  { role: 'CONTENT_CREATOR', id: 3 },
  { role: 'EMPLOYEE', id: 5 },
];

function authHeader({ role, id }) {
  mocks.users.set(id, {
    id,
    fullName: `Test ${role}`,
    isActive: true,
    role: { id, name: role },
    jobTitle: { id: 1, name: 'Content Creator' },
  });
  const token = jwt.sign({ sub: String(id), sid: `session-${id}` }, process.env.JWT_SECRET, {
    issuer: 'orvia-agency-os',
    audience: 'orvia-api',
  });
  return `Bearer ${token}`;
}

const taskBody = {
  title: 'Authorization test task',
  assignedTo: 2,
  plannedDeadline: new Date(Date.now() + 86_400_000).toISOString(),
};

describe('Tasks endpoint authorization', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123-at-least-32-chars';
  });

  it('requires authentication on every Tasks endpoint', async () => {
    const cases = [
      request(app).get('/api/tasks'),
      request(app).get('/api/tasks/7'),
      request(app).post('/api/tasks/direct').send(taskBody),
      request(app).post('/api/tasks/content-items/9/assign').send({}),
      request(app).patch('/api/tasks/7/status').send({ status: 'IN_PROGRESS' }),
      request(app).patch('/api/tasks/7').send({ title: 'Updated' }),
      request(app).delete('/api/tasks/7'),
    ];
    const responses = await Promise.all(cases);
    expect(responses.map((response) => response.status)).toEqual(Array(7).fill(401));
  });

  it.each(roleCases)('$role/$id receives role-based task access', async (user) => {
    const authorization = authHeader(user);
    const isManager = user.role === 'ADMIN' || user.role === 'ACCOUNT_MANAGER';
    const isAssignee = user.id === 2;
    const isCreator = user.id === 3;
    const canRead = isManager || isAssignee || isCreator;
    const canChangeStatus = isManager || isAssignee;
    const canBasicUpdate = isManager || isAssignee || isCreator;

    const [list, read, status, update, direct, assign, remove] = await Promise.all([
      request(app).get('/api/tasks').set('Authorization', authorization),
      request(app).get('/api/tasks/7').set('Authorization', authorization),
      request(app).patch('/api/tasks/7/status').set('Authorization', authorization).send({ status: 'IN_PROGRESS' }),
      request(app).patch('/api/tasks/7').set('Authorization', authorization).send({ title: 'Updated' }),
      request(app).post('/api/tasks/direct').set('Authorization', authorization).send(taskBody),
      request(app).post('/api/tasks/content-items/9/assign').set('Authorization', authorization).send({}),
      request(app).delete('/api/tasks/7').set('Authorization', authorization),
    ]);

    expect(list.status).toBe(200);
    expect(read.status).toBe(canRead ? 200 : 403);
    expect(status.status).toBe(canChangeStatus ? 200 : 403);
    expect(update.status).toBe(canBasicUpdate ? 200 : 403);
    expect(direct.status).toBe(isManager ? 201 : 403);
    expect(assign.status).toBe(user.role === 'ACCOUNT_MANAGER' ? 201 : 403);
    expect(remove.status).toBe(isManager ? 200 : 403);
  });
});
