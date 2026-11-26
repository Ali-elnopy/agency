import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const db = vi.hoisted(() => ({
  users: new Map(),
  items: [],
  lastWhere: null,
}));

function matchesCondition(item, cond) {
  if (!cond) return true;
  if (cond.AND) return cond.AND.every((c) => matchesCondition(item, c));
  if (cond.OR) return cond.OR.some((c) => matchesCondition(item, c));

  if (cond.scheduledDate) {
    const t = new Date(item.scheduledDate).getTime();
    if (cond.scheduledDate.gte && t < new Date(cond.scheduledDate.gte).getTime()) return false;
    if (cond.scheduledDate.lte && t > new Date(cond.scheduledDate.lte).getTime()) return false;
  }
  if (cond.campaignId !== undefined && item.campaignId !== cond.campaignId) return false;
  if (cond.type !== undefined && item.type !== cond.type) return false;
  if (cond.clientReviewStatus !== undefined && item.clientReviewStatus !== cond.clientReviewStatus) return false;
  if (cond.publishStatus !== undefined && item.publishStatus !== cond.publishStatus) return false;
  if (cond.createdBy !== undefined && item.createdBy !== cond.createdBy) return false;

  if (cond.contentPlan) {
    const cp = item.contentPlan;
    if (cond.contentPlan.brandId !== undefined && cp.brand.id !== cond.contentPlan.brandId) return false;
    if (cond.contentPlan.platformAccountId !== undefined && cp.platformAccount.id !== cond.contentPlan.platformAccountId) return false;
    if (cond.contentPlan.brand) {
      const b = cp.brand;
      if (cond.contentPlan.brand.accountManagerId !== undefined && b.accountManagerId !== cond.contentPlan.brand.accountManagerId) return false;
      if (cond.contentPlan.brand.clientId !== undefined && b.clientId !== cond.contentPlan.brand.clientId) return false;
      if (cond.contentPlan.brand.team?.memberships?.some?.userId !== undefined) {
        const uid = cond.contentPlan.brand.team.memberships.some.userId;
        if (!b.teamMemberIds.includes(uid)) return false;
      }
    }
  }

  if (cond.tasks?.some?.assignedTo !== undefined) {
    const uid = cond.tasks.some.assignedTo;
    if (!item.tasks.some((t) => t.assignedTo === uid)) return false;
  }

  return true;
}

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    contentItem: {
      findMany: async ({ where = {} } = {}) => {
        db.lastWhere = where;
        return db.items
          .filter((item) => matchesCondition(item, where))
          .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
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

describe('Feature #3: Content Calendar API', () => {
  beforeEach(() => {
    db.users.clear();
    db.items.length = 0;
    db.lastWhere = null;

    db.users.set(1, { id: 1, fullName: 'Admin', email: 'admin@test.com', isActive: true, role: { id: 1, name: 'ADMIN' }, jobTitle: null });
    db.users.set(2, { id: 2, fullName: 'AM 1', email: 'am1@test.com', isActive: true, role: { id: 2, name: 'ACCOUNT_MANAGER' }, jobTitle: null });
    db.users.set(5, { id: 5, fullName: 'Creative 1', email: 'c1@test.com', isActive: true, role: { id: 4, name: 'CREATIVE' }, jobTitle: null });
    db.users.set(7, { id: 7, fullName: 'Client 1', email: 'client1@test.com', isActive: true, role: { id: 5, name: 'CLIENT' }, jobTitle: null });

    db.items.push(
      {
        id: 1,
        title: 'Dec 05 Reel',
        type: 'REEL',
        scheduledDate: new Date('2026-12-05T10:00:00.000Z'),
        createdBy: 4,
        campaignId: 50,
        clientReviewStatus: 'APPROVED',
        publishStatus: 'PUBLISHED',
        publishedAt: new Date('2026-12-05T10:05:00.000Z'),
        publishUrl: 'https://instagram.com/reel/1',
        contentPlan: {
          id: 20,
          brand: { id: 10, name: 'Brand A', accountManagerId: 2, clientId: 7, teamMemberIds: [4, 5] },
          platformAccount: { id: 30, platform: 'INSTAGRAM', accountName: '@brandA' },
        },
        campaign: { id: 50, name: 'Winter Launch' },
        tasks: [{ id: 1, type: 'CONTENT_CREATION', status: 'COMPLETED', assignedTo: 5 }],
      },
      {
        id: 2,
        title: 'Dec 20 Post',
        type: 'POST',
        scheduledDate: new Date('2026-12-20T10:00:00.000Z'),
        createdBy: 4,
        campaignId: 51,
        clientReviewStatus: 'PENDING_CLIENT_REVIEW',
        publishStatus: 'NOT_PUBLISHED',
        publishedAt: null,
        publishUrl: null,
        contentPlan: {
          id: 21,
          brand: { id: 11, name: 'Brand B', accountManagerId: 3, clientId: 8, teamMemberIds: [9] },
          platformAccount: { id: 31, platform: 'TIKTOK', accountName: '@brandB' },
        },
        campaign: { id: 51, name: 'Holiday Sale' },
        tasks: [{ id: 2, type: 'REVIEW', status: 'IN_REVIEW', assignedTo: 3 }],
      },
    );
  });

  it('filters by date range, brand, campaign, platform, contentType, clientReviewStatus, and publishStatus', async () => {
    const res = await request(app)
      .get('/api/v1/content-items/calendar')
      .query({
        from: '2026-12-01T00:00:00.000Z',
        to: '2026-12-10T23:59:59.000Z',
        brandId: 10,
        campaignId: 50,
        platformAccountId: 30,
        contentType: 'REEL',
        clientReviewStatus: 'APPROVED',
        publishStatus: 'PUBLISHED',
      })
      .set('Authorization', tokenFor(1));

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.items[0]).toMatchObject({
      id: 1,
      title: 'Dec 05 Reel',
      contentType: 'REEL',
      clientReviewStatus: 'APPROVED',
      publishStatus: 'PUBLISHED',
      platform: { id: 30, platform: 'INSTAGRAM', accountName: '@brandA' },
      brand: { id: 10, name: 'Brand A' },
      campaign: { id: 50, name: 'Winter Launch' },
      taskStatus: 'COMPLETED',
    });
  });

  it('rejects invalid date range where from > to', async () => {
    const res = await request(app)
      .get('/api/v1/content-items/calendar')
      .query({
        from: '2026-12-25T00:00:00.000Z',
        to: '2026-12-01T00:00:00.000Z',
      })
      .set('Authorization', tokenFor(1));

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('enforces role-based scoping (ADMIN all, AM assigned brands, CLIENT own brand with null taskStatus, CREATIVE team/assigned)', async () => {
    // ADMIN sees both
    const adminRes = await request(app)
      .get('/api/v1/content-items/calendar')
      .set('Authorization', tokenFor(1));
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.total).toBe(2);

    // AM 1 sees only Brand A (id 1)
    const amRes = await request(app)
      .get('/api/v1/content-items/calendar')
      .set('Authorization', tokenFor(2));
    expect(amRes.status).toBe(200);
    expect(amRes.body.data.items.map((i) => i.id)).toEqual([1]);

    // CLIENT 1 sees only Brand A and internal taskStatus is hidden (null)
    const clientRes = await request(app)
      .get('/api/v1/content-items/calendar')
      .set('Authorization', tokenFor(7));
    expect(clientRes.status).toBe(200);
    expect(clientRes.body.data.items.map((i) => i.id)).toEqual([1]);
    expect(clientRes.body.data.items[0].taskStatus).toBeNull();

    // CREATIVE 1 sees only Brand A (team member / assigned task)
    const creativeRes = await request(app)
      .get('/api/v1/content-items/calendar')
      .set('Authorization', tokenFor(5));
    expect(creativeRes.status).toBe(200);
    expect(creativeRes.body.data.items.map((i) => i.id)).toEqual([1]);
  });
});
