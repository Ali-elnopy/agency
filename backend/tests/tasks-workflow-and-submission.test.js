import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  users: new Map(),
  taskById: null,
  reviewTask: null,
  reviewRule: { id: 1, contentType: 'REEL', taskType: 'REVIEW', offsetMinutes: -120, isActive: true },
  taskUpdates: [],
  txTaskUpdates: [],
  notifications: [],
}));

vi.mock('../src/modules/notifications/notifications.model.js', () => ({
  NotificationsModel: {
    create: async (data) => {
      mocks.notifications.push(data);
      return { id: mocks.notifications.length, ...data };
    },
  },
}));

vi.mock('../src/modules/auth/auth.model.js', () => ({
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

vi.mock('../src/modules/tasks/tasks.model.js', () => ({
  TasksModel: {
    list: async () => [],
    findById: async (id) => (mocks.taskById?.id === Number(id) ? { ...mocks.taskById } : null),
    update: async (id, data) => {
      mocks.taskUpdates.push({ id, data });
      if (mocks.taskById?.id === Number(id)) {
        mocks.taskById = { ...mocks.taskById, ...data };
        return { ...mocks.taskById };
      }
      return { id, ...data };
    },
    findDeadlineRule: async () => mocks.reviewRule,
    findUserById: async (id) => mocks.users.get(id) ?? null,
    create: async (data) => ({ id: 99, ...data }),
    remove: async (id) => ({ id }),
  },
}));

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    task: {
      findFirst: async () => (mocks.reviewTask ? { ...mocks.reviewTask } : null),
      update: async ({ where, data }) => {
        mocks.txTaskUpdates.push({ where, data });
        return { id: where.id, ...data };
      },
    },
    $transaction: async (callback) =>
      callback({
        task: {
          update: async ({ where, data }) => {
            mocks.txTaskUpdates.push({ where, data });
            if (mocks.taskById?.id === where.id) {
              mocks.taskById = { ...mocks.taskById, ...data };
              return { ...mocks.taskById };
            }
            if (mocks.reviewTask?.id === where.id) {
              mocks.reviewTask = { ...mocks.reviewTask, ...data };
              return { ...mocks.reviewTask };
            }
            return { id: where.id, ...data };
          },
          findFirst: async () => (mocks.reviewTask ? { ...mocks.reviewTask } : null),
        },
      }),
  },
}));

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123-at-least-32-chars';

const { default: app } = await import('../src/app.js');

function authHeader({ id, role, jobTitle = null }) {
  mocks.users.set(id, {
    id,
    fullName: `User ${id}`,
    email: `user${id}@test.com`,
    isActive: true,
    role: { id, name: role },
    jobTitle,
  });

  const token = jwt.sign(
    { sub: String(id), sid: `session-${id}` },
    process.env.JWT_SECRET,
    {
      issuer: 'orvia-agency-os',
      audience: 'orvia-api',
    },
  );

  return `Bearer ${token}`;
}

describe('Tasks workflow, submission, validation & /api/v1 mounting', () => {
  beforeEach(() => {
    mocks.users.clear();
    mocks.taskUpdates = [];
    mocks.txTaskUpdates = [];
    mocks.notifications = [];
    mocks.reviewRule = {
      id: 1,
      contentType: 'REEL',
      taskType: 'REVIEW',
      offsetMinutes: -120,
      isActive: true,
    };
    mocks.taskById = {
      id: 50,
      contentItemId: 10,
      type: 'CONTENT_CREATION',
      title: 'Create: Reel 1',
      description: null,
      assignedTo: 7,
      createdBy: 4,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      plannedDeadline: new Date('2026-12-01T12:00:00.000Z'),
      effectiveDeadline: new Date('2026-12-01T12:00:00.000Z'),
      startedAt: new Date('2026-11-25T10:00:00.000Z'),
      completedAt: null,
      submissionUrl: null,
      submissionNotes: null,
      submittedAt: null,
      contentItem: {
        id: 10,
        title: 'Reel 1',
        type: 'REEL',
        scheduledDate: new Date('2026-12-02T12:00:00.000Z'),
        contentPlanId: 1,
      },
    };
    mocks.reviewTask = {
      id: 51,
      contentItemId: 10,
      type: 'REVIEW',
      title: 'Review: Reel 1',
      assignedTo: 4,
      createdBy: 4,
      status: 'TODO',
      dependsOnTaskId: 50,
    };
  });

  it('mounts /api/v1/tasks and validates GET query parameters with taskListQuerySchema', async () => {
    const adminAuth = authHeader({ id: 1, role: 'ADMIN' });

    const okRes = await request(app)
      .get('/api/v1/tasks?status=TODO')
      .set('Authorization', adminAuth);
    expect(okRes.status).toBe(200);
    expect(okRes.body.success).toBe(true);

    const badRes = await request(app)
      .get('/api/tasks?unknownFilter=123')
      .set('Authorization', adminAuth);
    expect(badRes.status).toBe(400);
    expect(badRes.body.success).toBe(false);
  });

  it('allows assigned CREATIVE to submit a CONTENT_CREATION task and moves REVIEW to IN_REVIEW with recalculated effectiveDeadline', async () => {
    const creativeAuth = authHeader({ id: 7, role: 'CREATIVE' });

    const res = await request(app)
      .post('/api/tasks/50/submit')
      .set('Authorization', creativeAuth)
      .send({
        submissionUrl: 'https://drive.google.com/file/d/reel-1',
        submissionNotes: 'Final cut ready',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('SUBMITTED');
    expect(res.body.data.submissionUrl).toBe('https://drive.google.com/file/d/reel-1');
    expect(res.body.data.submissionNotes).toBe('Final cut ready');
    expect(res.body.data.submittedAt).toBeTruthy();

    // Verify linked REVIEW task was moved to IN_REVIEW with effectiveDeadline = submittedAt + 120m
    const reviewUpdate = mocks.txTaskUpdates.find((u) => u.where.id === 51);
    expect(reviewUpdate).toBeTruthy();
    expect(reviewUpdate.data.status).toBe('IN_REVIEW');
    expect(reviewUpdate.data.effectiveDeadline).toBeInstanceOf(Date);

    const submittedMs = new Date(res.body.data.submittedAt).getTime();
    const expectedMs = submittedMs + 120 * 60 * 1000;
    expect(reviewUpdate.data.effectiveDeadline.getTime()).toBe(expectedMs);
  });

  it('blocks non-CREATIVE or unassigned CREATIVE from submitting a content task', async () => {
    const otherCreativeAuth = authHeader({ id: 8, role: 'CREATIVE' });
    const amAuth = authHeader({ id: 4, role: 'ACCOUNT_MANAGER' });

    const res1 = await request(app)
      .post('/api/tasks/50/submit')
      .set('Authorization', otherCreativeAuth)
      .send({ submissionUrl: 'https://example.com/work' });
    expect(res1.status).toBe(403);

    const res2 = await request(app)
      .post('/api/tasks/50/submit')
      .set('Authorization', amAuth)
      .send({ submissionUrl: 'https://example.com/work' });
    expect(res2.status).toBe(403);
  });

  it('prevents CREATIVE from setting CONTENT_CREATION to SUBMITTED via PATCH /:id/status without mutating DB', async () => {
    const creativeAuth = authHeader({ id: 7, role: 'CREATIVE' });

    const res = await request(app)
      .patch('/api/tasks/50/status')
      .set('Authorization', creativeAuth)
      .send({ status: 'SUBMITTED' });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('content submission endpoint');
    expect(mocks.taskUpdates).toHaveLength(0);
  });

  it('updates task status properly via PATCH /:id/status and sets timestamps', async () => {
    mocks.taskById.status = 'TODO';
    mocks.taskById.startedAt = null;
    const creativeAuth = authHeader({ id: 7, role: 'CREATIVE' });

    const res = await request(app)
      .patch('/api/tasks/50/status')
      .set('Authorization', creativeAuth)
      .send({ status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('IN_PROGRESS');
    expect(res.body.data.startedAt).toBeTruthy();
  });

  it('preserves other fields when PATCH /api/tasks/:id includes status', async () => {
    const amAuth = authHeader({ id: 4, role: 'ACCOUNT_MANAGER' });

    const res = await request(app)
      .patch('/api/tasks/50')
      .set('Authorization', amAuth)
      .send({
        title: 'Updated Title',
        priority: 'HIGH',
        status: 'COMPLETED',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Title');
    expect(res.body.data.priority).toBe('HIGH');
    expect(res.body.data.status).toBe('COMPLETED');
    expect(res.body.data.completedAt).toBeTruthy();
    expect(mocks.taskUpdates).toHaveLength(2);
    expect(mocks.taskUpdates[0].data).toMatchObject({
      title: 'Updated Title',
      priority: 'HIGH',
    });
    expect(mocks.taskUpdates[1].data).toMatchObject({
      status: 'COMPLETED',
    });
  });
});
