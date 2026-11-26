import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const db = vi.hoisted(() => ({
  users: new Map(),
  brands: new Map(),
  contentPlans: new Map(),
  contentItems: new Map(),
  notifications: [],
}));

function hydrateContentItem(item) {
  if (!item) return null;
  const plan = db.contentPlans.get(item.contentPlanId);
  const brand = plan ? db.brands.get(plan.brandId) : null;
  const publisher = item.publishedBy ? db.users.get(item.publishedBy) : null;
  return {
    ...item,
    publisher: publisher
      ? { id: publisher.id, fullName: publisher.fullName, email: publisher.email }
      : null,
    contentPlan: plan
      ? {
          ...plan,
          brand: brand
            ? {
                ...brand,
                team: { memberships: (brand.teamMemberIds ?? []).map((userId) => ({ userId })) },
              }
            : null,
        }
      : null,
    tasks: [],
  };
}

function makePrismaApi() {
  return {
    contentItem: {
      findUnique: async ({ where = {} } = {}) => {
        const item = db.contentItems.get(Number(where.id));
        return item ? hydrateContentItem(item) : null;
      },
      update: async ({ where, data }) => {
        const existing = db.contentItems.get(Number(where.id));
        const updated = { ...existing, ...data, updatedAt: new Date() };
        db.contentItems.set(Number(where.id), updated);
        return hydrateContentItem(updated);
      },
    },
    notification: {
      create: async ({ data }) => {
        const record = { id: db.notifications.length + 1, ...data };
        db.notifications.push(record);
        return record;
      },
    },
    $transaction: async (cb) => cb(makePrismaApi()),
  };
}

vi.mock('../src/config/prisma.js', () => ({
  prisma: makePrismaApi(),
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

describe('Feature #2: Content Publishing Tracking', () => {
  beforeEach(() => {
    db.users.clear();
    db.brands.clear();
    db.contentPlans.clear();
    db.contentItems.clear();
    db.notifications.length = 0;

    db.users.set(1, { id: 1, fullName: 'Admin', email: 'admin@test.com', isActive: true, role: { id: 1, name: 'ADMIN' }, jobTitle: null });
    db.users.set(2, { id: 2, fullName: 'AM Assigned', email: 'am1@test.com', isActive: true, role: { id: 2, name: 'ACCOUNT_MANAGER' }, jobTitle: null });
    db.users.set(3, { id: 3, fullName: 'AM Other', email: 'am2@test.com', isActive: true, role: { id: 2, name: 'ACCOUNT_MANAGER' }, jobTitle: null });
    db.users.set(4, { id: 4, fullName: 'Creator', email: 'creator@test.com', isActive: true, role: { id: 3, name: 'CONTENT_CREATOR' }, jobTitle: null });
    db.users.set(5, { id: 5, fullName: 'Creative', email: 'creative@test.com', isActive: true, role: { id: 4, name: 'CREATIVE' }, jobTitle: null });
    db.users.set(7, { id: 7, fullName: 'Client Owner', email: 'client1@test.com', isActive: true, role: { id: 5, name: 'CLIENT' }, jobTitle: null });
    db.users.set(8, { id: 8, fullName: 'Client Other', email: 'client2@test.com', isActive: true, role: { id: 5, name: 'CLIENT' }, jobTitle: null });

    db.brands.set(10, { id: 10, name: 'Brand A', clientId: 7, accountManagerId: 2, teamId: 1, teamMemberIds: [4] });
    db.contentPlans.set(20, { id: 20, title: 'Dec Plan', brandId: 10, platformAccountId: 30, year: 2026, month: 12 });

    db.contentItems.set(100, {
      id: 100,
      contentPlanId: 20,
      createdBy: 4,
      scheduledDate: new Date('2026-12-10T10:00:00.000Z'),
      type: 'POST',
      title: 'Approved Post',
      clientReviewStatus: 'APPROVED',
      clientApprovedAt: new Date('2026-12-01T10:00:00.000Z'),
      publishStatus: 'NOT_PUBLISHED',
      publishedAt: null,
      publishUrl: null,
      publishedBy: null,
      publishNotes: null,
    });

    db.contentItems.set(101, {
      id: 101,
      contentPlanId: 20,
      createdBy: 4,
      scheduledDate: new Date('2026-12-12T10:00:00.000Z'),
      type: 'POST',
      title: 'Unapproved Post',
      clientReviewStatus: 'PENDING_CLIENT_REVIEW',
      clientApprovedAt: null,
      publishStatus: 'NOT_PUBLISHED',
      publishedAt: null,
      publishUrl: null,
      publishedBy: null,
      publishNotes: null,
    });
  });

  it('rejects publishing when content item is not APPROVED by client', async () => {
    const res = await request(app)
      .patch('/api/v1/content-items/101/publishing')
      .set('Authorization', tokenFor(2))
      .send({
        publishStatus: 'PUBLISHED',
        publishUrl: 'https://instagram.com/p/abc123',
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/approved by the client/i);
  });

  it('validates publishUrl format and requirement when marking as PUBLISHED', async () => {
    // Missing publishUrl when PUBLISHED
    const missingUrl = await request(app)
      .patch('/api/v1/content-items/100/publishing')
      .set('Authorization', tokenFor(2))
      .send({ publishStatus: 'PUBLISHED' });
    expect(missingUrl.status).toBe(400);
    expect(missingUrl.body.message).toMatch(/Publish URL is required/i);

    // Invalid URL
    const invalidUrl = await request(app)
      .patch('/api/v1/content-items/100/publishing')
      .set('Authorization', tokenFor(2))
      .send({ publishStatus: 'PUBLISHED', publishUrl: 'not-a-url' });
    expect(invalidUrl.status).toBe(400);

    // Non-http(s) protocol URL
    const badProto = await request(app)
      .patch('/api/v1/content-items/100/publishing')
      .set('Authorization', tokenFor(2))
      .send({ publishStatus: 'PUBLISHED', publishUrl: 'javascript:alert(1)' });
    expect(badProto.status).toBe(400);
  });

  it('supports SCHEDULED -> PUBLISHED transition, sets publishedAt/publishedBy, notifies client, and blocks invalid revert', async () => {
    // Schedule first
    const schedRes = await request(app)
      .patch('/api/v1/content-items/100/publishing')
      .set('Authorization', tokenFor(2))
      .send({ publishStatus: 'SCHEDULED', publishNotes: 'Queued in Meta Business Suite' });
    expect(schedRes.status).toBe(200);
    expect(schedRes.body.data.publishStatus).toBe('SCHEDULED');
    expect(schedRes.body.data.publishedAt).toBeNull();
    expect(db.notifications).toHaveLength(0);

    // Mark published
    const pubRes = await request(app)
      .patch('/api/v1/content-items/100/publishing')
      .set('Authorization', tokenFor(2))
      .send({
        publishStatus: 'PUBLISHED',
        publishUrl: 'https://instagram.com/p/live-post-100',
        publishNotes: 'Went live on time',
      });
    expect(pubRes.status).toBe(200);
    expect(pubRes.body.data.publishStatus).toBe('PUBLISHED');
    expect(pubRes.body.data.publishUrl).toBe('https://instagram.com/p/live-post-100');
    expect(pubRes.body.data.publishedAt).toBeTruthy();
    expect(pubRes.body.data.publishedBy).toBe(2);

    // Client notification created
    expect(db.notifications).toHaveLength(1);
    expect(db.notifications[0].recipientId).toBe(7);
    expect(db.notifications[0].type).toBe('CONTENT_PUBLISHED');

    // Invalid transition: PUBLISHED -> SCHEDULED rejected
    const revertRes = await request(app)
      .patch('/api/v1/content-items/100/publishing')
      .set('Authorization', tokenFor(1))
      .send({ publishStatus: 'SCHEDULED' });
    expect(revertRes.status).toBe(400);
    expect(revertRes.body.message).toMatch(/cannot be reverted/i);
  });

  it('enforces authorization on GET and PATCH publishing endpoints', async () => {
    // CLIENT cannot PATCH publishing
    expect(
      (await request(app)
        .patch('/api/v1/content-items/100/publishing')
        .set('Authorization', tokenFor(7))
        .send({ publishStatus: 'SCHEDULED' })).status,
    ).toBe(403);

    // CREATIVE and CONTENT_CREATOR cannot PATCH publishing
    expect(
      (await request(app)
        .patch('/api/v1/content-items/100/publishing')
        .set('Authorization', tokenFor(5))
        .send({ publishStatus: 'SCHEDULED' })).status,
    ).toBe(403);
    expect(
      (await request(app)
        .patch('/api/v1/content-items/100/publishing')
        .set('Authorization', tokenFor(4))
        .send({ publishStatus: 'SCHEDULED' })).status,
    ).toBe(403);

    // Unassigned AM cannot PATCH or GET
    expect(
      (await request(app)
        .patch('/api/v1/content-items/100/publishing')
        .set('Authorization', tokenFor(3))
        .send({ publishStatus: 'SCHEDULED' })).status,
    ).toBe(403);
    expect(
      (await request(app).get('/api/v1/content-items/100/publishing').set('Authorization', tokenFor(3))).status,
    ).toBe(403);

    // Owning CLIENT can GET, Other CLIENT gets 403
    expect(
      (await request(app).get('/api/v1/content-items/100/publishing').set('Authorization', tokenFor(7))).status,
    ).toBe(200);
    expect(
      (await request(app).get('/api/v1/content-items/100/publishing').set('Authorization', tokenFor(8))).status,
    ).toBe(403);
  });
});
