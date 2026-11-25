import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  users: new Map(),
  tasks: new Map(),
  reviewRule: {
    id: 1,
    contentType: 'REEL',
    taskType: 'REVIEW',
    offsetMinutes: -180,
    isActive: true,
  },
  notifications: [],
  createdTasks: [],
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

vi.mock('../src/modules/notifications/notifications.model.js', () => ({
  NotificationsModel: {
    create: async (data) => {
      const record = { id: mocks.notifications.length + 1, ...data };
      mocks.notifications.push(record);
      return record;
    },
  },
}));

vi.mock('../src/modules/tasks/tasks.model.js', () => ({
  TasksModel: {
    findById: async (id) => {
      const found = mocks.tasks.get(Number(id));
      return found ? { ...found } : null;
    },
    update: async (id, data) => {
      const existing = mocks.tasks.get(Number(id));
      const updated = { ...existing, ...data };
      mocks.tasks.set(Number(id), updated);
      return { ...updated };
    },
    findDeadlineRule: async () => mocks.reviewRule,
  },
}));

function makeTxTaskApi() {
  return {
    findFirst: async ({ where }) => {
      for (const task of mocks.tasks.values()) {
        if (where.contentItemId !== undefined && task.contentItemId !== where.contentItemId) {
          continue;
        }
        if (where.type !== undefined && task.type !== where.type) {
          continue;
        }
        if (where.status?.not && task.status === where.status.not) {
          continue;
        }
        if (where.status?.notIn && where.status.notIn.includes(task.status)) {
          continue;
        }
        return { ...task };
      }
      return null;
    },
    update: async ({ where, data }) => {
      const existing = mocks.tasks.get(Number(where.id));
      const updated = { ...existing, ...data };
      mocks.tasks.set(Number(where.id), updated);
      return { ...updated };
    },
    create: async ({ data }) => {
      mocks.createdTasks.push(data);
      return { id: 999, ...data };
    },
  };
}

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    task: makeTxTaskApi(),
    $transaction: async (callback) =>
      callback({
        task: makeTxTaskApi(),
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

describe('Internal Review Workflow (PATCH /api/tasks/:id/review & resubmission)', () => {
  beforeEach(() => {
    mocks.users.clear();
    mocks.tasks.clear();
    mocks.notifications = [];
    mocks.createdTasks = [];
    mocks.reviewRule = {
      id: 1,
      contentType: 'REEL',
      taskType: 'REVIEW',
      offsetMinutes: -180,
      isActive: true,
    };

    const contentItem = {
      id: 100,
      title: 'Launch Reel',
      type: 'REEL',
      scheduledDate: new Date('2026-12-10T12:00:00.000Z'),
      contentPlanId: 10,
      reference: 'https://ref.example.com',
      toneOfVoice: 'Bold',
      caption: 'Launch caption',
      notes: 'Keep under 30s',
      contentPlan: {
        id: 10,
        brandId: 201,
        brand: {
          id: 201,
          accountManagerId: 4,
        },
      },
    };

    mocks.tasks.set(50, {
      id: 50,
      contentItemId: 100,
      type: 'CONTENT_CREATION',
      title: 'Create: Launch Reel',
      description: null,
      assignedTo: 7,
      createdBy: 4,
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      plannedDeadline: new Date('2026-12-08T12:00:00.000Z'),
      effectiveDeadline: new Date('2026-12-08T12:00:00.000Z'),
      startedAt: new Date('2026-12-07T09:00:00.000Z'),
      completedAt: null,
      submissionUrl: 'https://drive.google.com/file/v1',
      submissionNotes: 'First cut ready',
      submittedAt: new Date('2026-12-07T15:00:00.000Z'),
      dependsOnTaskId: null,
      contentItem,
    });

    mocks.tasks.set(51, {
      id: 51,
      contentItemId: 100,
      type: 'REVIEW',
      title: 'Review: Launch Reel',
      description: null,
      assignedTo: 4,
      createdBy: 4,
      status: 'IN_REVIEW',
      priority: 'HIGH',
      plannedDeadline: new Date('2026-12-09T12:00:00.000Z'),
      effectiveDeadline: new Date('2026-12-07T18:00:00.000Z'),
      startedAt: null,
      completedAt: null,
      submissionUrl: null,
      submissionNotes: null,
      submittedAt: null,
      dependsOnTaskId: 50,
      contentItem,
    });
  });

  it('1. Account Manager can approve (COMPLETED) a submitted task without creating another review task', async () => {
    const amAuth = authHeader({ id: 4, role: 'ACCOUNT_MANAGER' });

    const res = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', amAuth)
      .send({
        decision: 'COMPLETED',
        notes: 'Looks great, approved internally.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.creationTask.status).toBe('COMPLETED');
    expect(res.body.data.creationTask.completedAt).toBeTruthy();
    expect(res.body.data.reviewTask.status).toBe('COMPLETED');
    expect(res.body.data.reviewTask.completedAt).toBeTruthy();
    expect(res.body.data.reviewTask.description).toBe('Looks great, approved internally.');

    // Previous submission data preserved
    expect(res.body.data.creationTask.submissionUrl).toBe('https://drive.google.com/file/v1');
    expect(res.body.data.creationTask.submissionNotes).toBe('First cut ready');
    expect(res.body.data.creationTask.submittedAt).toBeTruthy();

    // No extra review task created
    expect(mocks.createdTasks).toHaveLength(0);

    // Creator notified of approval
    expect(mocks.notifications).toHaveLength(1);
    expect(mocks.notifications[0]).toMatchObject({
      recipientId: 7,
      type: 'TASK_REVIEW_APPROVED',
    });
  });

  it('2. Account Manager can request changes (NEEDS_CHANGES) and preserves submission data', async () => {
    const amAuth = authHeader({ id: 4, role: 'ACCOUNT_MANAGER' });

    const res = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', amAuth)
      .send({
        decision: 'NEEDS_CHANGES',
        notes: 'Please adjust color grading in intro.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.creationTask.status).toBe('NEEDS_CHANGES');
    expect(res.body.data.creationTask.completedAt).toBeNull();
    expect(res.body.data.reviewTask.status).toBe('NEEDS_CHANGES');
    expect(res.body.data.reviewTask.description).toBe('Please adjust color grading in intro.');

    // Previous submission data is NOT destroyed
    expect(res.body.data.creationTask.submissionUrl).toBe('https://drive.google.com/file/v1');
    expect(res.body.data.creationTask.submissionNotes).toBe('First cut ready');
    expect(res.body.data.creationTask.submittedAt).toBeTruthy();

    // Creator notified of requested changes
    expect(mocks.notifications).toHaveLength(1);
    expect(mocks.notifications[0]).toMatchObject({
      recipientId: 7,
      type: 'TASK_NEEDS_CHANGES',
    });
  });

  it('3. CREATIVE and CONTENT_CREATOR cannot approve or reject tasks', async () => {
    const creativeAuth = authHeader({ id: 7, role: 'CREATIVE' });
    const creatorAuth = authHeader({ id: 3, role: 'CONTENT_CREATOR' });

    const resCreative = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', creativeAuth)
      .send({ decision: 'COMPLETED' });
    expect(resCreative.status).toBe(403);

    const resCreator = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', creatorAuth)
      .send({ decision: 'NEEDS_CHANGES' });
    expect(resCreator.status).toBe(403);

    // Also cannot bypass review via PATCH /:id/status
    const resBypass = await request(app)
      .patch('/api/tasks/50/status')
      .set('Authorization', creativeAuth)
      .send({ status: 'COMPLETED' });
    expect(resBypass.status).toBe(403);
  });

  it('4. CLIENT cannot access internal review endpoint', async () => {
    const clientAuth = authHeader({ id: 101, role: 'CLIENT' });

    const res = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', clientAuth)
      .send({ decision: 'COMPLETED' });

    expect(res.status).toBe(403);
  });

  it('5, 6, 7 & 10. Creator can resubmit after NEEDS_CHANGES, REVIEW returns to IN_REVIEW, deadline recalculates, and omitted notes preserve prior submissionNotes', async () => {
    const amAuth = authHeader({ id: 4, role: 'ACCOUNT_MANAGER' });
    const creativeAuth = authHeader({ id: 7, role: 'CREATIVE' });

    // Step 1: AM requests changes
    const reviewRes = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', amAuth)
      .send({
        decision: 'NEEDS_CHANGES',
        notes: 'Fix audio levels',
      });
    expect(reviewRes.status).toBe(200);
    expect(mocks.tasks.get(50).status).toBe('NEEDS_CHANGES');
    expect(mocks.tasks.get(51).status).toBe('NEEDS_CHANGES');

    // Step 2: Creator resubmits with new URL (omitting submissionNotes -> preserves prior notes)
    const resubmitRes = await request(app)
      .post('/api/tasks/50/submit')
      .set('Authorization', creativeAuth)
      .send({
        submissionUrl: 'https://drive.google.com/file/v2',
      });

    expect(resubmitRes.status).toBe(200);
    expect(resubmitRes.body.data.status).toBe('SUBMITTED');
    expect(resubmitRes.body.data.submissionUrl).toBe('https://drive.google.com/file/v2');
    // Previous submissionNotes preserved because new notes were not passed
    expect(resubmitRes.body.data.submissionNotes).toBe('First cut ready');

    // REVIEW task returned to IN_REVIEW and deadline recalculated (+180 minutes from new submittedAt)
    const updatedReview = mocks.tasks.get(51);
    expect(updatedReview.status).toBe('IN_REVIEW');
    expect(updatedReview.effectiveDeadline).toBeInstanceOf(Date);
    const submittedMs = new Date(resubmitRes.body.data.submittedAt).getTime();
    expect(updatedReview.effectiveDeadline.getTime()).toBe(submittedMs + 180 * 60 * 1000);

    // Reviewer notified of resubmission
    const submissionNotif = mocks.notifications.find((n) => n.type === 'TASK_SUBMITTED');
    expect(submissionNotif).toBeTruthy();
    expect(submissionNotif.recipientId).toBe(4);
  });

  it('8. Invalid review decisions and non-submitted task states are rejected with 400', async () => {
    const amAuth = authHeader({ id: 4, role: 'ACCOUNT_MANAGER' });

    const invalidDecisionRes = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', amAuth)
      .send({ decision: 'APPROVED' });
    expect(invalidDecisionRes.status).toBe(400);

    // Move task to IN_PROGRESS (not SUBMITTED)
    mocks.tasks.get(50).status = 'IN_PROGRESS';
    const notSubmittedRes = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', amAuth)
      .send({ decision: 'COMPLETED' });
    expect(notSubmittedRes.status).toBe(400);
  });

  it('9. Unauthorized Account Manager for another brand cannot review the task, while ADMIN can', async () => {
    const otherAmAuth = authHeader({ id: 8, role: 'ACCOUNT_MANAGER' });
    const adminAuth = authHeader({ id: 1, role: 'ADMIN' });

    const forbiddenRes = await request(app)
      .patch('/api/tasks/50/review')
      .set('Authorization', otherAmAuth)
      .send({ decision: 'COMPLETED' });
    expect(forbiddenRes.status).toBe(403);

    // ADMIN can review via either CONTENT_CREATION id or REVIEW id
    const adminRes = await request(app)
      .patch('/api/tasks/51/review')
      .set('Authorization', adminAuth)
      .send({ decision: 'COMPLETED', notes: 'Admin approved' });
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.creationTask.status).toBe('COMPLETED');
    expect(adminRes.body.data.reviewTask.status).toBe('COMPLETED');
  });
});
