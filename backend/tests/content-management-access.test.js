import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const state = vi.hoisted(() => ({
  users: new Map(),
  platformAccounts: [],
  contentPlans: [],
  campaigns: [],
  contentItems: [],
}));

vi.mock('../src/modules/auth/auth.model.js', () => ({
  AuthModel: {
    findSessionById: async (id) => ({
      id,
      userId: Number(id.replace('session-', '')),
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    }),
    findUserById: async (id) => state.users.get(id),
  },
}));

vi.mock('../src/modules/platform-accounts/platform-accounts.model.js', () => ({
  PlatformAccountsModel: {
    list: async ({ accessWhere } = {}) =>
      state.platformAccounts.filter((acc) => {
        if (accessWhere?.clientId !== undefined) return acc.brand.clientId === accessWhere.clientId;
        if (accessWhere?.accountManagerId !== undefined) {
          return acc.brand.accountManagerId === accessWhere.accountManagerId;
        }
        const memberId = accessWhere?.team?.is?.memberships?.some?.userId;
        if (memberId !== undefined) {
          return acc.brand.team.memberships.some((m) => m.userId === memberId);
        }
        return true;
      }),
    findAccessibleBrandById: async (id, accessWhere) => {
      if (id !== 201) return null;
      if (accessWhere?.accountManagerId && accessWhere.accountManagerId !== 4) return null;
      return { id: 201, accountManagerId: 4 };
    },
    create: async (data) => ({ id: 901, ...data }),
  },
}));

vi.mock('../src/modules/content-plans/content-plans.model.js', () => ({
  ContentPlansModel: {
    findById: async (id) => state.contentPlans.find((p) => p.id === Number(id)) ?? null,
    findAccessibleById: async (id, accessWhere) =>
      state.contentPlans.find((p) => {
        if (p.id !== Number(id)) return false;
        const memberId = accessWhere?.team?.is?.memberships?.some?.userId;
        if (memberId !== undefined) {
          return p.brand.team.memberships.some((m) => m.userId === memberId);
        }
        if (accessWhere?.accountManagerId !== undefined) {
          return p.brand.accountManagerId === accessWhere.accountManagerId;
        }
        if (accessWhere?.clientId !== undefined) {
          return p.brand.clientId === accessWhere.clientId;
        }
        return true;
      }) ?? null,
    findAccessibleBrandById: async (id, accessWhere) => {
      const plan = state.contentPlans.find((p) => p.brandId === Number(id));
      if (!plan) return null;
      const memberId = accessWhere?.team?.is?.memberships?.some?.userId;
      if (memberId !== undefined && !plan.brand.team.memberships.some((m) => m.userId === memberId)) {
        return null;
      }
      return plan.brand;
    },
    update: async (id, data) => {
      const plan = state.contentPlans.find((p) => p.id === Number(id));
      Object.assign(plan, data);
      return plan;
    },
  },
}));

vi.mock('../src/modules/campaigns/campaigns.model.js', () => ({
  CampaignsModel: {
    list: async ({ accessWhere } = {}) =>
      state.campaigns.filter((c) => {
        if (accessWhere?.clientId !== undefined) {
          return c.contentPlan.brand.clientId === accessWhere.clientId;
        }
        const memberId = accessWhere?.team?.is?.memberships?.some?.userId;
        if (memberId !== undefined) {
          return c.contentPlan.brand.team.memberships.some((m) => m.userId === memberId);
        }
        return true;
      }),
    findById: async (id, accessWhere) =>
      state.campaigns.find((c) => {
        if (c.id !== Number(id)) return false;
        if (accessWhere?.clientId !== undefined) {
          return c.contentPlan.brand.clientId === accessWhere.clientId;
        }
        const memberId = accessWhere?.team?.is?.memberships?.some?.userId;
        if (memberId !== undefined) {
          return c.contentPlan.brand.team.memberships.some((m) => m.userId === memberId);
        }
        return true;
      }) ?? null,
    findContentPlanById: async (id) =>
      state.contentPlans.find((p) => p.id === Number(id)) ?? null,
    create: async (data) => ({ id: 801, ...data }),
    update: async (id, data) => ({ id, ...data }),
    remove: async (id) => ({ id }),
  },
}));

vi.mock('../src/modules/content-items/content-items.model.js', () => ({
  ContentItemsModel: {
    findContentPlanById: async (id) =>
      state.contentPlans.find((p) => p.id === Number(id)) ?? null,
    findById: async (id) => state.contentItems.find((i) => i.id === Number(id)) ?? null,
    create: async (data) => ({ id: 701, ...data }),
    update: async (id, data) => ({ id, ...data }),
    remove: async (id) => ({ id }),
  },
}));

vi.mock('../src/modules/notifications/notifications.model.js', () => ({
  NotificationsModel: {
    create: async (data) => ({ id: 1, ...data }),
  },
}));

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    $transaction: async (cb) => cb({}),
  },
}));

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123-at-least-32-chars';

const { default: app } = await import('../src/app.js');

function authHeader({ id, role, jobTitle = null }) {
  state.users.set(id, {
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

describe('Content Management baseline access fixes', () => {
  beforeEach(() => {
    state.users.clear();

    const brandA = {
      id: 201,
      name: 'Brand A',
      clientId: 101,
      accountManagerId: 4,
      teamId: 10,
      team: { memberships: [{ userId: 3 }] },
    };

    const brandB = {
      id: 202,
      name: 'Brand B',
      clientId: 102,
      accountManagerId: 5,
      teamId: 20,
      team: { memberships: [{ userId: 9 }] },
    };

    state.platformAccounts = [
      { id: 1, brandId: 201, platform: 'Instagram', accountName: '@brandA', brand: brandA },
      { id: 2, brandId: 202, platform: 'TikTok', accountName: '@brandB', brand: brandB },
    ];

    state.contentPlans = [
      { id: 11, brandId: 201, title: 'Plan A', status: 'DRAFT', brand: brandA },
      { id: 12, brandId: 202, title: 'Plan B', status: 'DRAFT', brand: brandB },
    ];

    state.campaigns = [
      {
        id: 21,
        contentPlanId: 11,
        name: 'Campaign A',
        startDate: new Date('2026-11-01T00:00:00.000Z'),
        endDate: new Date('2026-11-30T00:00:00.000Z'),
        contentPlan: state.contentPlans[0],
      },
      {
        id: 22,
        contentPlanId: 12,
        name: 'Campaign B',
        startDate: new Date('2026-11-01T00:00:00.000Z'),
        endDate: new Date('2026-11-30T00:00:00.000Z'),
        contentPlan: state.contentPlans[1],
      },
    ];

    state.contentItems = [
      {
        id: 31,
        contentPlanId: 11,
        campaignId: null,
        scheduledDate: new Date('2026-11-15T10:00:00.000Z'),
        type: 'POST',
        title: 'Item A',
      },
      {
        id: 32,
        contentPlanId: 12,
        campaignId: null,
        scheduledDate: new Date('2026-11-15T10:00:00.000Z'),
        type: 'POST',
        title: 'Item B',
      },
    ];
  });

  it('resolves { id, name } roles properly in platform-accounts for ADMIN, AM, CONTENT_CREATOR, and CLIENT', async () => {
    const adminRes = await request(app)
      .get('/api/platform-accounts')
      .set('Authorization', authHeader({ id: 1, role: 'ADMIN' }));
    expect(adminRes.status).toBe(200);
    expect(adminRes.body.data.accounts).toHaveLength(2);

    const creatorRes = await request(app)
      .get('/api/platform-accounts')
      .set('Authorization', authHeader({ id: 3, role: 'CONTENT_CREATOR' }));
    expect(creatorRes.status).toBe(200);
    expect(creatorRes.body.data.accounts.map((a) => a.id)).toEqual([1]);

    const clientRes = await request(app)
      .get('/api/platform-accounts')
      .set('Authorization', authHeader({ id: 101, role: 'CLIENT' }));
    expect(clientRes.status).toBe(200);
    expect(clientRes.body.data.accounts.map((a) => a.id)).toEqual([1]);

    const createAsCreator = await request(app)
      .post('/api/platform-accounts')
      .set('Authorization', authHeader({ id: 3, role: 'CONTENT_CREATOR' }))
      .send({ brandId: 201, platform: 'Instagram', accountName: '@new' });
    expect(createAsCreator.status).toBe(403);
  });

  it('allows canonical CONTENT_CREATOR to submit content plan to IN_REVIEW but blocks setting APPROVED or NEEDS_CHANGES', async () => {
    const creatorAuth = authHeader({ id: 3, role: 'CONTENT_CREATOR' });

    const approveRes = await request(app)
      .patch('/api/content-plans/11/status')
      .set('Authorization', creatorAuth)
      .send({ status: 'APPROVED' });
    expect(approveRes.status).toBe(403);

    const changesRes = await request(app)
      .patch('/api/content-plans/11/status')
      .set('Authorization', creatorAuth)
      .send({ status: 'NEEDS_CHANGES' });
    expect(changesRes.status).toBe(403);

    const submitRes = await request(app)
      .patch('/api/content-plans/11/status')
      .set('Authorization', creatorAuth)
      .send({ status: 'IN_REVIEW' });
    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.status).toBe('IN_REVIEW');
  });

  it('scopes campaigns reads for CLIENT to their own brand only', async () => {
    const clientAuth = authHeader({ id: 101, role: 'CLIENT' });

    const listRes = await request(app)
      .get('/api/campaigns')
      .set('Authorization', clientAuth);
    expect(listRes.status).toBe(200);
    expect(listRes.body.data.campaigns.map((c) => c.id)).toEqual([21]);

    const otherRes = await request(app)
      .get('/api/campaigns/22')
      .set('Authorization', clientAuth);
    expect(otherRes.status).toBe(404);
  });

  it('enforces team membership for CONTENT_CREATOR on campaign and content-item mutations', async () => {
    const creatorAuth = authHeader({ id: 3, role: 'CONTENT_CREATOR' });

    // Own team's content plan (11) -> succeeds
    const okCampaign = await request(app)
      .post('/api/campaigns')
      .set('Authorization', creatorAuth)
      .send({
        contentPlanId: 11,
        name: 'Team Campaign',
        startDate: '2026-11-05T00:00:00.000Z',
        endDate: '2026-11-20T00:00:00.000Z',
      });
    expect(okCampaign.status).toBe(201);

    // Other team's content plan (12) -> 403
    const forbiddenCampaign = await request(app)
      .post('/api/campaigns')
      .set('Authorization', creatorAuth)
      .send({
        contentPlanId: 12,
        name: 'Other Team Campaign',
        startDate: '2026-11-05T00:00:00.000Z',
        endDate: '2026-11-20T00:00:00.000Z',
      });
    expect(forbiddenCampaign.status).toBe(403);

    // Own team's content item -> succeeds
    const okItem = await request(app)
      .post('/api/content-items')
      .set('Authorization', creatorAuth)
      .send({
        contentPlanId: 11,
        scheduledDate: '2026-11-12T10:00:00.000Z',
        type: 'POST',
        title: 'Team Post',
      });
    expect(okItem.status).toBe(201);

    // Other team's content item -> 403
    const forbiddenItem = await request(app)
      .post('/api/content-items')
      .set('Authorization', creatorAuth)
      .send({
        contentPlanId: 12,
        scheduledDate: '2026-11-12T10:00:00.000Z',
        type: 'POST',
        title: 'Other Team Post',
      });
    expect(forbiddenItem.status).toBe(403);

    // Deleting other team's content item -> 403
    const forbiddenDelete = await request(app)
      .delete('/api/content-items/32')
      .set('Authorization', creatorAuth);
    expect(forbiddenDelete.status).toBe(403);
  });
});
