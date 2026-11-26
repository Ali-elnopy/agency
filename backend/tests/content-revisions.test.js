import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const db = vi.hoisted(() => ({
  users: new Map(),
  brands: new Map(),
  contentPlans: new Map(),
  contentItems: new Map(),
  revisions: [],
  tasks: new Map(),
  changeRequests: new Map(),
  notifications: [],
  nextRevisionId: 1,
  nextTaskId: 500,
}));

function hydrateContentItem(item) {
  if (!item) return null;
  const plan = db.contentPlans.get(item.contentPlanId);
  const brand = plan ? db.brands.get(plan.brandId) : null;
  const tasks = [...db.tasks.values()].filter((t) => t.contentItemId === item.id);
  return {
    ...item,
    contentPlan: plan
      ? {
          ...plan,
          brand: brand
            ? {
                ...brand,
                team: brand.teamMemberIds
                  ? {
                      memberships: brand.teamMemberIds.map((userId) => ({ userId })),
                    }
                  : null,
              }
            : null,
        }
      : null,
    tasks,
  };
}

function hydrateRevision(rev) {
  if (!rev) return null;
  const creator = db.users.get(rev.createdBy);
  return {
    ...rev,
    creator: creator
      ? { id: creator.id, fullName: creator.fullName, email: creator.email }
      : null,
  };
}

function makePrismaApi() {
  return {
    contentItem: {
      findFirst: async ({ where = {} } = {}) => {
        const item = db.contentItems.get(Number(where.id));
        if (!item) return null;
        if (where.contentPlan?.brand?.clientId !== undefined) {
          const plan = db.contentPlans.get(item.contentPlanId);
          const brand = plan ? db.brands.get(plan.brandId) : null;
          if (!brand || brand.clientId !== where.contentPlan.brand.clientId) return null;
        }
        return hydrateContentItem(item);
      },
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
    contentPlan: {
      findUnique: async ({ where = {} } = {}) => {
        const plan = db.contentPlans.get(Number(where.id));
        if (!plan) return null;
        const brand = db.brands.get(plan.brandId);
        return {
          ...plan,
          brand: brand
            ? {
                ...brand,
                team: brand.teamMemberIds
                  ? {
                      memberships: brand.teamMemberIds.map((userId) => ({ userId })),
                    }
                  : null,
              }
            : null,
        };
      },
    },
    contentItemRevision: {
      findFirst: async ({ where = {}, orderBy } = {}) => {
        let items = db.revisions.filter((r) => {
          if (where.id !== undefined && r.id !== Number(where.id)) return false;
          if (where.contentItemId !== undefined && r.contentItemId !== Number(where.contentItemId)) return false;
          return true;
        });
        if (orderBy?.revisionNumber === 'desc') {
          items = [...items].sort((a, b) => b.revisionNumber - a.revisionNumber);
        } else if (orderBy?.revisionNumber === 'asc') {
          items = [...items].sort((a, b) => a.revisionNumber - b.revisionNumber);
        }
        return items[0] ? hydrateRevision(items[0]) : null;
      },
      findMany: async ({ where = {}, orderBy } = {}) => {
        let items = db.revisions.filter((r) => {
          if (where.contentItemId !== undefined && r.contentItemId !== Number(where.contentItemId)) return false;
          return true;
        });
        const dir = Array.isArray(orderBy)
          ? orderBy[0]?.revisionNumber
          : orderBy?.revisionNumber;
        items = [...items].sort((a, b) =>
          dir === 'asc'
            ? a.revisionNumber - b.revisionNumber
            : b.revisionNumber - a.revisionNumber,
        );
        return items.map(hydrateRevision);
      },
      create: async ({ data }) => {
        const record = {
          id: db.nextRevisionId++,
          createdAt: new Date(),
          ...data,
        };
        db.revisions.push(record);
        return hydrateRevision(record);
      },
    },
    task: {
      findUnique: async ({ where = {} } = {}) => {
        const t = db.tasks.get(Number(where.id));
        if (!t) return null;
        const item = t.contentItemId ? db.contentItems.get(t.contentItemId) : null;
        return { ...t, contentItem: item ? hydrateContentItem(item) : null };
      },
      findFirst: async ({ where = {} } = {}) => {
        for (const t of db.tasks.values()) {
          if (where.contentItemId !== undefined && t.contentItemId !== where.contentItemId) continue;
          if (where.dependsOnTaskId !== undefined && t.dependsOnTaskId !== where.dependsOnTaskId) continue;
          if (where.type !== undefined) {
            if (typeof where.type === 'string' && t.type !== where.type) continue;
            if (where.type?.in && !where.type.in.includes(t.type)) continue;
          }
          if (where.status?.notIn && where.status.notIn.includes(t.status)) continue;
          return { ...t };
        }
        return null;
      },
      create: async ({ data }) => {
        const id = db.nextTaskId++;
        const record = { id, createdAt: new Date(), updatedAt: new Date(), ...data };
        db.tasks.set(id, record);
        return record;
      },
      update: async ({ where, data }) => {
        const existing = db.tasks.get(Number(where.id));
        const updated = { ...existing, ...data, updatedAt: new Date() };
        db.tasks.set(Number(where.id), updated);
        const item = updated.contentItemId ? db.contentItems.get(updated.contentItemId) : null;
        return { ...updated, contentItem: item ? hydrateContentItem(item) : null };
      },
    },
    taskDeadlineRule: {
      findUnique: async () => null,
    },
    clientChangeRequest: {
      findUnique: async ({ where = {} } = {}) => {
        const cr = db.changeRequests.get(Number(where.id));
        if (!cr) return null;
        const item = db.contentItems.get(cr.contentItemId);
        const brand = db.brands.get(cr.brandId);
        return { ...cr, contentItem: item ? { ...item } : null, brand: brand ? { ...brand } : null };
      },
      update: async ({ where, data }) => {
        const existing = db.changeRequests.get(Number(where.id));
        const updated = { ...existing, ...data };
        db.changeRequests.set(Number(where.id), updated);
        return updated;
      },
    },
    user: {
      findUnique: async ({ where = {} } = {}) => db.users.get(Number(where.id)) ?? null,
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

describe('Feature #1: Content Item Revision History', () => {
  beforeEach(() => {
    db.users.clear();
    db.brands.clear();
    db.contentPlans.clear();
    db.contentItems.clear();
    db.revisions.length = 0;
    db.tasks.clear();
    db.changeRequests.clear();
    db.notifications.length = 0;
    db.nextRevisionId = 1;
    db.nextTaskId = 500;

    db.users.set(1, { id: 1, fullName: 'Admin', email: 'admin@test.com', isActive: true, role: { id: 1, name: 'ADMIN' }, jobTitle: null });
    db.users.set(2, { id: 2, fullName: 'AM One', email: 'am1@test.com', isActive: true, role: { id: 2, name: 'ACCOUNT_MANAGER' }, jobTitle: null });
    db.users.set(3, { id: 3, fullName: 'AM Two', email: 'am2@test.com', isActive: true, role: { id: 2, name: 'ACCOUNT_MANAGER' }, jobTitle: null });
    db.users.set(4, { id: 4, fullName: 'Creator One', email: 'creator@test.com', isActive: true, role: { id: 3, name: 'CONTENT_CREATOR' }, jobTitle: null });
    db.users.set(5, { id: 5, fullName: 'Creative Assigned', email: 'creative1@test.com', isActive: true, role: { id: 4, name: 'CREATIVE' }, jobTitle: null });
    db.users.set(6, { id: 6, fullName: 'Creative Other', email: 'creative2@test.com', isActive: true, role: { id: 4, name: 'CREATIVE' }, jobTitle: null });
    db.users.set(7, { id: 7, fullName: 'Client One', email: 'client1@test.com', isActive: true, role: { id: 5, name: 'CLIENT' }, jobTitle: null });
    db.users.set(8, { id: 8, fullName: 'Client Two', email: 'client2@test.com', isActive: true, role: { id: 5, name: 'CLIENT' }, jobTitle: null });

    db.brands.set(10, { id: 10, name: 'Brand A', clientId: 7, accountManagerId: 2, teamId: 1, teamMemberIds: [4] });
    db.contentPlans.set(20, { id: 20, title: 'Nov Plan', brandId: 10, platformAccountId: 30, year: 2026, month: 11 });
    db.contentItems.set(100, {
      id: 100,
      contentPlanId: 20,
      campaignId: null,
      createdBy: 4,
      scheduledDate: new Date('2026-12-01T10:00:00.000Z'),
      type: 'REEL',
      title: 'Initial Title',
      reference: 'https://ref.example.com/1',
      toneOfVoice: 'Energetic',
      caption: 'Initial caption',
      notes: 'Initial notes',
      clientReviewStatus: 'NOT_READY',
      clientApprovedAt: null,
      publishStatus: 'NOT_PUBLISHED',
      publishedAt: null,
      publishUrl: null,
      publishedBy: null,
      publishNotes: null,
    });

    db.tasks.set(200, {
      id: 200,
      contentItemId: 100,
      type: 'CONTENT_CREATION',
      title: 'Create: Initial Title',
      assignedTo: 5,
      createdBy: 2,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      plannedDeadline: new Date('2026-11-30T10:00:00.000Z'),
      effectiveDeadline: new Date('2026-11-30T10:00:00.000Z'),
    });
    db.tasks.set(201, {
      id: 201,
      contentItemId: 100,
      type: 'REVIEW',
      title: 'Review: Initial Title',
      assignedTo: 2,
      createdBy: 2,
      status: 'TODO',
      priority: 'HIGH',
      dependsOnTaskId: 200,
    });
  });

  it('creates sequential revisions on content update, task submission, and client change forward, and skips no-op updates', async () => {
    // 1. Meaningful update creates Revision 1
    const updateRes = await request(app)
      .patch('/api/v1/content-items/100')
      .set('Authorization', tokenFor(4))
      .send({ caption: 'Updated caption v1', changeReason: 'Refined hook' });
    expect(updateRes.status).toBe(200);
    expect(db.revisions).toHaveLength(1);
    expect(db.revisions[0].revisionNumber).toBe(1);
    expect(db.revisions[0].source).toBe('CONTENT_UPDATE');
    expect(db.revisions[0].caption).toBe('Updated caption v1');
    expect(db.revisions[0].changeReason).toBe('Refined hook');

    // 2. Non-meaningful (no-op) update does NOT create a revision
    const noopRes = await request(app)
      .patch('/api/v1/content-items/100')
      .set('Authorization', tokenFor(4))
      .send({ caption: 'Updated caption v1' });
    expect(noopRes.status).toBe(200);
    expect(db.revisions).toHaveLength(1);

    // 3. Content creation submission creates Revision 2
    const submitRes = await request(app)
      .post('/api/v1/tasks/200/submit')
      .set('Authorization', tokenFor(5))
      .send({
        submissionUrl: 'https://cdn.example.com/reel-v1.mp4',
        submissionNotes: 'First cut ready',
      });
    expect(submitRes.status).toBe(200);
    expect(db.revisions).toHaveLength(2);
    expect(db.revisions[1].revisionNumber).toBe(2);
    expect(db.revisions[1].source).toBe('CONTENT_CREATION_SUBMISSION');
    expect(db.revisions[1].submissionUrl).toBe('https://cdn.example.com/reel-v1.mp4');
    expect(db.revisions[1].taskId).toBe(200);

    // 4. Forwarding a client change request creates Revision 3
    db.changeRequests.set(300, {
      id: 300,
      contentItemId: 100,
      brandId: 10,
      clientId: 7,
      accountManagerId: 2,
      status: 'PENDING',
      clientNotes: 'Please brighten the intro',
    });
    const forwardRes = await request(app)
      .patch('/api/v1/client-change-requests/300/forward')
      .set('Authorization', tokenFor(2))
      .send({ notes: 'Adjust color grading' });
    expect(forwardRes.status).toBe(200);
    expect(db.revisions).toHaveLength(3);
    expect(db.revisions[2].revisionNumber).toBe(3);
    expect(db.revisions[2].source).toBe('CLIENT_CHANGE_REQUEST');
    expect(db.revisions[2].changeReason).toBe('Please brighten the intro');

    // 5. Retrieve revisions in default desc order and asc order
    const listDesc = await request(app)
      .get('/api/v1/content-items/100/revisions')
      .set('Authorization', tokenFor(1));
    expect(listDesc.status).toBe(200);
    expect(listDesc.body.data.total).toBe(3);
    expect(listDesc.body.data.revisions.map((r) => r.revisionNumber)).toEqual([3, 2, 1]);

    const listAsc = await request(app)
      .get('/api/v1/content-items/100/revisions?order=asc')
      .set('Authorization', tokenFor(1));
    expect(listAsc.status).toBe(200);
    expect(listAsc.body.data.revisions.map((r) => r.revisionNumber)).toEqual([1, 2, 3]);

    // 6. Retrieve single revision by ID
    const singleRes = await request(app)
      .get(`/api/v1/content-items/100/revisions/${db.revisions[1].id}`)
      .set('Authorization', tokenFor(1));
    expect(singleRes.status).toBe(200);
    expect(singleRes.body.data.revisionNumber).toBe(2);
    expect(singleRes.body.data.submissionUrl).toBe('https://cdn.example.com/reel-v1.mp4');
  });

  it('enforces authorization and brand/client/task isolation on revision history endpoints', async () => {
    db.revisions.push({
      id: 1,
      contentItemId: 100,
      revisionNumber: 1,
      title: 'Initial Title',
      type: 'REEL',
      scheduledDate: new Date('2026-12-01T10:00:00.000Z'),
      source: 'CONTENT_UPDATE',
      changeReason: 'Test',
      createdBy: 4,
      createdAt: new Date(),
    });

    // Assigned AM → 200
    expect(
      (await request(app).get('/api/v1/content-items/100/revisions').set('Authorization', tokenFor(2))).status,
    ).toBe(200);

    // Unassigned AM → 403
    expect(
      (await request(app).get('/api/v1/content-items/100/revisions').set('Authorization', tokenFor(3))).status,
    ).toBe(403);

    // Owning Client → 200
    expect(
      (await request(app).get('/api/v1/content-items/100/revisions').set('Authorization', tokenFor(7))).status,
    ).toBe(200);

    // Other Client → 403
    expect(
      (await request(app).get('/api/v1/content-items/100/revisions').set('Authorization', tokenFor(8))).status,
    ).toBe(403);

    // Assigned Creative (via task) → 200
    expect(
      (await request(app).get('/api/v1/content-items/100/revisions').set('Authorization', tokenFor(5))).status,
    ).toBe(200);

    // Unrelated Creative → 403
    expect(
      (await request(app).get('/api/v1/content-items/100/revisions').set('Authorization', tokenFor(6))).status,
    ).toBe(403);

    // Single revision 404 when revision doesn't exist
    expect(
      (await request(app).get('/api/v1/content-items/100/revisions/999').set('Authorization', tokenFor(1))).status,
    ).toBe(404);
  });
});
