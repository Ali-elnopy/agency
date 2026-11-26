import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const db = vi.hoisted(() => ({
  users: new Map(),
  tasks: [],
}));

function matchesTaskWhere(task, where) {
  if (!where) return true;
  if (where.AND) return where.AND.every((c) => matchesTaskWhere(task, c));
  if (where.OR) return where.OR.some((c) => matchesTaskWhere(task, c));

  if (where.assignedTo !== undefined && task.assignedTo !== where.assignedTo) return false;
  if (where.createdBy !== undefined && task.createdBy !== where.createdBy) return false;

  if (where.status !== undefined) {
    if (typeof where.status === 'string' && task.status !== where.status) return false;
    if (where.status?.notIn && where.status.notIn.includes(task.status)) return false;
  }

  if (where.completedAt?.not === null && task.completedAt === null) return false;

  if (where.effectiveDeadline === null && task.effectiveDeadline !== null) return false;
  if (where.effectiveDeadline?.lt) {
    if (!task.effectiveDeadline) return false;
    if (new Date(task.effectiveDeadline) >= new Date(where.effectiveDeadline.lt)) return false;
  }
  if (where.plannedDeadline?.lt) {
    if (!task.plannedDeadline) return false;
    if (new Date(task.plannedDeadline) >= new Date(where.plannedDeadline.lt)) return false;
  }

  if (where.createdAt) {
    const t = new Date(task.createdAt).getTime();
    if (where.createdAt.gte && t < new Date(where.createdAt.gte).getTime()) return false;
    if (where.createdAt.lte && t > new Date(where.createdAt.lte).getTime()) return false;
  }

  if (where.contentItem) {
    if (!task.contentItem) return false;
    if (where.contentItem.campaignId !== undefined && task.contentItem.campaignId !== where.contentItem.campaignId) {
      return false;
    }
    if (where.contentItem.contentPlan) {
      if (where.contentItem.contentPlan.brandId !== undefined && task.contentItem.contentPlan.brandId !== where.contentItem.contentPlan.brandId) {
        return false;
      }
      if (where.contentItem.contentPlan.brand?.accountManagerId !== undefined) {
        if (task.contentItem.contentPlan.brand.accountManagerId !== where.contentItem.contentPlan.brand.accountManagerId) {
          return false;
        }
      }
    }
  }

  if (where.assignee?.memberships?.some?.teamId !== undefined) {
    const teamId = where.assignee.memberships.some.teamId;
    const assignee = db.users.get(task.assignedTo);
    if (!assignee || !(assignee.teamIds ?? []).includes(teamId)) return false;
  }

  return true;
}

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    task: {
      groupBy: async ({ by, where = {} }) => {
        const filtered = db.tasks.filter((t) => matchesTaskWhere(t, where));
        const buckets = new Map();
        for (const t of filtered) {
          const key = by.map((k) => t[k]).join('|');
          if (!buckets.has(key)) {
            const entry = { _count: { _all: 0 } };
            for (const k of by) entry[k] = t[k];
            buckets.set(key, entry);
          }
          buckets.get(key)._count._all += 1;
        }
        return [...buckets.values()];
      },
      count: async ({ where = {} } = {}) => {
        return db.tasks.filter((t) => matchesTaskWhere(t, where)).length;
      },
      findMany: async ({ where = {} } = {}) => {
        return db.tasks.filter((t) => matchesTaskWhere(t, where));
      },
    },
    user: {
      findMany: async ({ where = {} } = {}) => {
        const ids = where.id?.in ?? [];
        return ids.map((id) => db.users.get(id)).filter(Boolean);
      },
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
    findUserById: async (id) => db.users.get(id),
  },
}));

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123-at-least-32-chars';
const { default: app } = await import('../src/app.js');

function tokenFor(userId) {
  const token = jwt.sign(
    { sub: String(userId), sid: `session-${userId}` },
    process.env.JWT_SECRET,
    { issuer: 'orvia-agency-os', audience: 'orvia-api' },
  );
  return `Bearer ${token}`;
}

describe('Features #4 & #5: Progress Tracking & Team Performance', () => {
  beforeEach(() => {
    db.users.clear();
    db.tasks.length = 0;

    db.users.set(1, { id: 1, fullName: 'Admin', email: 'admin@test.com', isActive: true, role: { id: 1, name: 'ADMIN' }, jobTitle: null, teamIds: [] });
    db.users.set(2, { id: 2, fullName: 'AM One', email: 'am1@test.com', isActive: true, role: { id: 2, name: 'ACCOUNT_MANAGER' }, jobTitle: null, teamIds: [1] });
    db.users.set(5, { id: 5, fullName: 'Alice Creative', email: 'alice@test.com', isActive: true, role: { id: 4, name: 'CREATIVE' }, jobTitle: { id: 1, name: 'Video Editor' }, teamIds: [1] });
    db.users.set(6, { id: 6, fullName: 'Bob Creator', email: 'bob@test.com', isActive: true, role: { id: 3, name: 'CONTENT_CREATOR' }, jobTitle: { id: 2, name: 'Copywriter' }, teamIds: [2] });
    db.users.set(7, { id: 7, fullName: 'Client User', email: 'client@test.com', isActive: true, role: { id: 5, name: 'CLIENT' }, jobTitle: null, teamIds: [] });

    const now = Date.now();
    const hour = 60 * 60 * 1000;

    db.tasks.push(
      // Alice: Completed ON TIME (took 4 hours)
      {
        id: 1,
        assignedTo: 5,
        createdBy: 2,
        status: 'COMPLETED',
        createdAt: new Date(now - 10 * hour),
        startedAt: new Date(now - 8 * hour),
        completedAt: new Date(now - 4 * hour),
        plannedDeadline: new Date(now - 2 * hour),
        effectiveDeadline: new Date(now - 2 * hour),
        contentItem: { campaignId: 50, contentPlan: { brandId: 10, brand: { accountManagerId: 2 } } },
      },
      // Alice: Completed LATE by 2 hours (took 6 hours)
      {
        id: 2,
        assignedTo: 5,
        createdBy: 2,
        status: 'COMPLETED',
        createdAt: new Date(now - 12 * hour),
        startedAt: new Date(now - 10 * hour),
        completedAt: new Date(now - 4 * hour),
        plannedDeadline: new Date(now - 6 * hour),
        effectiveDeadline: new Date(now - 6 * hour),
        contentItem: { campaignId: 50, contentPlan: { brandId: 10, brand: { accountManagerId: 2 } } },
      },
      // Alice: IN_PROGRESS and OVERDUE
      {
        id: 3,
        assignedTo: 5,
        createdBy: 2,
        status: 'IN_PROGRESS',
        createdAt: new Date(now - 20 * hour),
        startedAt: new Date(now - 15 * hour),
        completedAt: null,
        plannedDeadline: new Date(now - 1 * hour),
        effectiveDeadline: new Date(now - 1 * hour),
        contentItem: { campaignId: 50, contentPlan: { brandId: 10, brand: { accountManagerId: 2 } } },
      },
      // Bob: TODO, NOT overdue, belongs to Brand 11 (AM 3)
      {
        id: 4,
        assignedTo: 6,
        createdBy: 3,
        status: 'TODO',
        createdAt: new Date(now - 5 * hour),
        startedAt: null,
        completedAt: null,
        plannedDeadline: new Date(now + 24 * hour),
        effectiveDeadline: null,
        contentItem: { campaignId: 51, contentPlan: { brandId: 11, brand: { accountManagerId: 3 } } },
      },
      // Bob: SUBMITTED and OVERDUE (using plannedDeadline when effectiveDeadline is null)
      {
        id: 5,
        assignedTo: 6,
        createdBy: 3,
        status: 'SUBMITTED',
        createdAt: new Date(now - 30 * hour),
        startedAt: new Date(now - 25 * hour),
        completedAt: null,
        plannedDeadline: new Date(now - 3 * hour),
        effectiveDeadline: null,
        contentItem: { campaignId: 51, contentPlan: { brandId: 11, brand: { accountManagerId: 3 } } },
      },
    );
  });

  describe('GET /api/v1/dashboard/progress', () => {
    it('calculates task counts, overdueTasks, completionRate, and averageCompletionTime for ADMIN', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/progress')
        .set('Authorization', tokenFor(1));

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        totalTasks: 5,
        todoTasks: 1,
        inProgressTasks: 1,
        submittedTasks: 1,
        inReviewTasks: 0,
        needsChangesTasks: 0,
        completedTasks: 2,
        cancelledTasks: 0,
        overdueTasks: 2,
        completionRate: 40,
        averageCompletionTime: 5,
      });
    });

    it('supports brandId, campaignId, assigneeId, status filters and rejects invalid date range', async () => {
      const filtered = await request(app)
        .get('/api/v1/dashboard/progress')
        .query({ brandId: 10, campaignId: 50, assigneeId: 5 })
        .set('Authorization', tokenFor(1));

      expect(filtered.status).toBe(200);
      expect(filtered.body.data.totalTasks).toBe(3);
      expect(filtered.body.data.completedTasks).toBe(2);
      expect(filtered.body.data.overdueTasks).toBe(1);

      const invalidRange = await request(app)
        .get('/api/v1/dashboard/progress')
        .query({ from: '2026-12-20T00:00:00.000Z', to: '2026-12-01T00:00:00.000Z' })
        .set('Authorization', tokenFor(1));
      expect(invalidRange.status).toBe(400);
    });

    it('enforces authorization for AM, CREATIVE, and CLIENT', async () => {
      // AM One only sees Brand 10 tasks (3 tasks)
      const amRes = await request(app)
        .get('/api/v1/dashboard/progress')
        .set('Authorization', tokenFor(2));
      expect(amRes.status).toBe(200);
      expect(amRes.body.data.totalTasks).toBe(3);

      // CREATIVE sees own tasks only
      const creativeRes = await request(app)
        .get('/api/v1/dashboard/progress')
        .set('Authorization', tokenFor(5));
      expect(creativeRes.status).toBe(200);
      expect(creativeRes.body.data.totalTasks).toBe(3);

      // CREATIVE cannot query another assigneeId
      const forbiddenRes = await request(app)
        .get('/api/v1/dashboard/progress')
        .query({ assigneeId: 6 })
        .set('Authorization', tokenFor(5));
      expect(forbiddenRes.status).toBe(403);

      // CLIENT gets 403
      const clientRes = await request(app)
        .get('/api/v1/dashboard/progress')
        .set('Authorization', tokenFor(7));
      expect(clientRes.status).toBe(403);
    });
  });

  describe('GET /api/v1/dashboard/team-performance', () => {
    it('calculates per-employee metrics (completionRate, onTimeRate, overdueTasks, averageCompletionTime, averageDelay)', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/team-performance')
        .set('Authorization', tokenFor(1));

      expect(res.status).toBe(200);
      expect(res.body.data.totalMembers).toBe(2);

      const alice = res.body.data.members.find((m) => m.user.id === 5);
      expect(alice).toMatchObject({
        totalAssignedTasks: 3,
        completedTasks: 2,
        inProgressTasks: 1,
        overdueTasks: 1,
        completedOnTime: 1,
        completedLate: 1,
        completionRate: 66.67,
        onTimeRate: 50,
        averageCompletionTime: 5,
        averageDelay: 2,
      });

      const bob = res.body.data.members.find((m) => m.user.id === 6);
      expect(bob).toMatchObject({
        totalAssignedTasks: 2,
        completedTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 1,
        completedOnTime: 0,
        completedLate: 0,
        completionRate: 0,
        onTimeRate: 0,
        averageCompletionTime: null,
        averageDelay: null,
      });
    });

    it('supports teamId, userId, brandId filters and rejects invalid date range', async () => {
      const teamRes = await request(app)
        .get('/api/v1/dashboard/team-performance')
        .query({ teamId: 1 })
        .set('Authorization', tokenFor(1));
      expect(teamRes.status).toBe(200);
      expect(teamRes.body.data.members.map((m) => m.user.id)).toEqual([5]);

      const invalidRange = await request(app)
        .get('/api/v1/dashboard/team-performance')
        .query({ from: '2026-12-20T00:00:00.000Z', to: '2026-12-01T00:00:00.000Z' })
        .set('Authorization', tokenFor(1));
      expect(invalidRange.status).toBe(400);
    });

    it('enforces authorization for AM, CREATIVE, and CLIENT', async () => {
      // AM One only sees Alice (Brand 10)
      const amRes = await request(app)
        .get('/api/v1/dashboard/team-performance')
        .set('Authorization', tokenFor(2));
      expect(amRes.status).toBe(200);
      expect(amRes.body.data.members.map((m) => m.user.id)).toEqual([5]);

      // CREATIVE sees own metrics
      const creativeSelf = await request(app)
        .get('/api/v1/dashboard/team-performance')
        .set('Authorization', tokenFor(5));
      expect(creativeSelf.status).toBe(200);
      expect(creativeSelf.body.data.members.map((m) => m.user.id)).toEqual([5]);

      // CREATIVE cannot query another userId or teamId
      expect(
        (await request(app)
          .get('/api/v1/dashboard/team-performance')
          .query({ userId: 6 })
          .set('Authorization', tokenFor(5))).status,
      ).toBe(403);
      expect(
        (await request(app)
          .get('/api/v1/dashboard/team-performance')
          .query({ teamId: 1 })
          .set('Authorization', tokenFor(5))).status,
      ).toBe(403);

      // CLIENT gets 403
      expect(
        (await request(app)
          .get('/api/v1/dashboard/team-performance')
          .set('Authorization', tokenFor(7))).status,
      ).toBe(403);
    });
  });
});
