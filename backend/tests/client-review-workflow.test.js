import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const db = vi.hoisted(() => ({
  users: new Map(),
  brands: new Map(),
  contentItems: new Map(),
  tasks: new Map(),
  changeRequests: new Map(),
  notifications: [],
  nextTaskId: 100,
  nextChangeRequestId: 1,
  deadlineRules: new Map([
    ['REEL:CONTENT_CREATION', { id: 1, contentType: 'REEL', taskType: 'CONTENT_CREATION', offsetMinutes: -1440, isActive: true }],
    ['REEL:REVIEW', { id: 2, contentType: 'REEL', taskType: 'REVIEW', offsetMinutes: -180, isActive: true }],
  ]),
}));

function hydrateContentItem(item) {
  if (!item) return null;
  const brand = db.brands.get(item.brandId);
  return {
    ...item,
    contentPlan: {
      id: item.contentPlanId,
      brandId: item.brandId,
      brand: brand ? { ...brand } : null,
    },
  };
}

function hydrateTask(task) {
  if (!task) return null;
  const item = task.contentItemId ? db.contentItems.get(task.contentItemId) : null;
  return {
    ...task,
    contentItem: item ? hydrateContentItem(item) : null,
  };
}

function hydrateChangeRequest(cr) {
  if (!cr) return null;
  const item = db.contentItems.get(cr.contentItemId);
  const brand = db.brands.get(cr.brandId);
  const client = db.users.get(cr.clientId);
  const am = db.users.get(cr.accountManagerId);
  const relatedTask = cr.relatedTaskId ? db.tasks.get(cr.relatedTaskId) : null;
  return {
    ...cr,
    contentItem: item ? { ...item } : null,
    brand: brand ? { ...brand } : null,
    client: client ? { id: client.id, fullName: client.fullName, email: client.email } : null,
    accountManager: am ? { id: am.id, fullName: am.fullName, email: am.email } : null,
    relatedTask: relatedTask ? { ...relatedTask } : null,
  };
}

function makePrismaApi() {
  return {
    task: {
      findFirst: async ({ where = {}, orderBy } = {}) => {
        let items = [...db.tasks.values()];
        items = items.filter((t) => {
          if (where.contentItemId !== undefined && t.contentItemId !== where.contentItemId) return false;
          if (where.dependsOnTaskId !== undefined && t.dependsOnTaskId !== where.dependsOnTaskId) return false;
          if (where.type !== undefined) {
            if (typeof where.type === 'string' && t.type !== where.type) return false;
            if (where.type?.in && !where.type.in.includes(t.type)) return false;
          }
          if (where.status?.not && t.status === where.status.not) return false;
          if (where.status?.notIn && where.status.notIn.includes(t.status)) return false;
          return true;
        });
        if (orderBy) {
          const desc = Array.isArray(orderBy)
            ? orderBy.some((o) => o.createdAt === 'desc' || o.id === 'desc')
            : orderBy.createdAt === 'desc' || orderBy.id === 'desc';
          items.sort((a, b) => (desc ? b.id - a.id : a.id - b.id));
        }
        return items[0] ? hydrateTask(items[0]) : null;
      },
      create: async ({ data }) => {
        const id = db.nextTaskId++;
        const record = {
          id,
          createdAt: new Date(),
          updatedAt: new Date(),
          startedAt: null,
          completedAt: null,
          submissionUrl: null,
          submissionNotes: null,
          submittedAt: null,
          dependsOnTaskId: null,
          ...data,
        };
        db.tasks.set(id, record);
        return hydrateTask(record);
      },
      update: async ({ where, data }) => {
        const existing = db.tasks.get(Number(where.id));
        const updated = { ...existing, ...data, updatedAt: new Date() };
        db.tasks.set(Number(where.id), updated);
        return hydrateTask(updated);
      },
    },
    contentItem: {
      update: async ({ where, data }) => {
        const existing = db.contentItems.get(Number(where.id));
        const updated = { ...existing, ...data, updatedAt: new Date() };
        db.contentItems.set(Number(where.id), updated);
        return { ...updated };
      },
    },
    clientChangeRequest: {
      create: async ({ data }) => {
        const id = db.nextChangeRequestId++;
        const record = {
          id,
          status: 'PENDING',
          accountManagerNotes: null,
          relatedTaskId: null,
          resolvedAt: null,
          forwardedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          ...data,
        };
        db.changeRequests.set(id, record);
        return hydrateChangeRequest(record);
      },
      update: async ({ where, data }) => {
        const existing = db.changeRequests.get(Number(where.id));
        const updated = { ...existing, ...data, updatedAt: new Date() };
        db.changeRequests.set(Number(where.id), updated);
        return hydrateChangeRequest(updated);
      },
    },
  };
}

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

vi.mock('../src/modules/notifications/notifications.model.js', () => ({
  NotificationsModel: {
    create: async (data) => {
      const record = { id: db.notifications.length + 1, ...data };
      db.notifications.push(record);
      return record;
    },
  },
}));

vi.mock('../src/modules/tasks/tasks.model.js', () => ({
  TasksModel: {
    findById: async (id) => hydrateTask(db.tasks.get(Number(id))),
    update: async (id, data) => {
      const existing = db.tasks.get(Number(id));
      const updated = { ...existing, ...data, updatedAt: new Date() };
      db.tasks.set(Number(id), updated);
      return hydrateTask(updated);
    },
    findDeadlineRule: async (contentType, taskType) =>
      db.deadlineRules.get(`${contentType}:${taskType}`) ?? null,
    findUserById: async (id) => db.users.get(Number(id)) ?? null,
    list: async () => [...db.tasks.values()].map(hydrateTask),
  },
}));

vi.mock('../src/modules/client-change-requests/client-change-requests.model.js', () => ({
  changeRequestSelect: {},
  ClientChangeRequestsModel: {
    list: async (where = {}) => {
      return [...db.changeRequests.values()]
        .filter((cr) => {
          const brand = db.brands.get(cr.brandId);
          if (where.brand?.accountManagerId !== undefined && brand?.accountManagerId !== where.brand.accountManagerId) {
            return false;
          }
          if (where.clientId !== undefined && cr.clientId !== where.clientId) return false;
          if (where.status !== undefined && cr.status !== where.status) return false;
          if (where.contentItemId !== undefined && cr.contentItemId !== where.contentItemId) return false;
          if (where.brandId !== undefined && cr.brandId !== where.brandId) return false;
          return true;
        })
        .map(hydrateChangeRequest);
    },
    findById: async (id) => hydrateChangeRequest(db.changeRequests.get(Number(id))),
    findContentItemForReview: async (id) => hydrateContentItem(db.contentItems.get(Number(id))),
    findLatestCreationTask: async (contentItemId) => {
      const matches = [...db.tasks.values()]
        .filter(
          (t) =>
            t.contentItemId === Number(contentItemId) &&
            (t.type === 'CONTENT_CREATION' || t.type === 'CONTENT_MODIFICATION'),
        )
        .sort((a, b) => b.id - a.id);
      return matches[0] ? { ...matches[0] } : null;
    },
    findLatestReviewTask: async (contentItemId) => {
      const matches = [...db.tasks.values()]
        .filter((t) => t.contentItemId === Number(contentItemId) && t.type === 'REVIEW')
        .sort((a, b) => b.id - a.id);
      return matches[0] ? { ...matches[0] } : null;
    },
    findUserById: async (id) => db.users.get(Number(id)) ?? null,
    findDeadlineRule: async (contentType, taskType) =>
      db.deadlineRules.get(`${contentType}:${taskType}`) ?? null,
  },
}));

vi.mock('../src/config/prisma.js', () => ({
  prisma: {
    ...makePrismaApi(),
    $transaction: async (callback) => callback(makePrismaApi()),
  },
}));

process.env.JWT_SECRET = 'test-secret-test-secret-test-secret-123-at-least-32-chars';

const { default: app } = await import('../src/app.js');

function registerUser({ id, role, fullName = `User ${id}` }) {
  db.users.set(id, {
    id,
    fullName,
    email: `user${id}@test.com`,
    isActive: true,
    role: { id, name: role },
    jobTitle: null,
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

describe('Client Review & Account Manager Mediation Workflow', () => {
  let adminAuth;
  let amAuth;
  let otherAmAuth;
  let creativeAuth;
  let clientAuth;
  let otherClientAuth;

  beforeEach(() => {
    db.users.clear();
    db.brands.clear();
    db.contentItems.clear();
    db.tasks.clear();
    db.changeRequests.clear();
    db.notifications = [];
    db.nextTaskId = 100;
    db.nextChangeRequestId = 1;

    adminAuth = registerUser({ id: 1, role: 'ADMIN', fullName: 'Admin' });
    amAuth = registerUser({ id: 4, role: 'ACCOUNT_MANAGER', fullName: 'AM Brand A' });
    otherAmAuth = registerUser({ id: 8, role: 'ACCOUNT_MANAGER', fullName: 'AM Brand B' });
    creativeAuth = registerUser({ id: 7, role: 'CREATIVE', fullName: 'Creative 7' });
    clientAuth = registerUser({ id: 101, role: 'CLIENT', fullName: 'Client A' });
    otherClientAuth = registerUser({ id: 102, role: 'CLIENT', fullName: 'Client B' });

    db.brands.set(201, {
      id: 201,
      name: 'Brand A',
      clientId: 101,
      accountManagerId: 4,
    });
    db.brands.set(202, {
      id: 202,
      name: 'Brand B',
      clientId: 102,
      accountManagerId: 8,
    });

    // Content Item 10 (Brand A) — already internally approved, ready for Client Review
    db.contentItems.set(10, {
      id: 10,
      contentPlanId: 1,
      brandId: 201,
      createdBy: 3,
      title: 'Launch Reel',
      type: 'REEL',
      scheduledDate: new Date('2026-12-20T12:00:00.000Z'),
      clientReviewStatus: 'PENDING_CLIENT_REVIEW',
      clientApprovedAt: null,
    });

    // Content Item 11 (Brand A) — still NOT_READY
    db.contentItems.set(11, {
      id: 11,
      contentPlanId: 1,
      brandId: 201,
      createdBy: 3,
      title: 'Draft Reel',
      type: 'REEL',
      scheduledDate: new Date('2026-12-22T12:00:00.000Z'),
      clientReviewStatus: 'NOT_READY',
      clientApprovedAt: null,
    });

    // Initial completed CONTENT_CREATION + REVIEW tasks for Content Item 10
    db.tasks.set(50, {
      id: 50,
      contentItemId: 10,
      type: 'CONTENT_CREATION',
      title: 'Create: Launch Reel',
      assignedTo: 7,
      createdBy: 4,
      status: 'COMPLETED',
      priority: 'MEDIUM',
      submissionUrl: 'https://drive.google.com/v1',
      submissionNotes: 'v1 cut',
      submittedAt: new Date('2026-12-10T10:00:00.000Z'),
      completedAt: new Date('2026-12-10T12:00:00.000Z'),
      dependsOnTaskId: null,
    });

    db.tasks.set(51, {
      id: 51,
      contentItemId: 10,
      type: 'REVIEW',
      title: 'Review: Launch Reel',
      assignedTo: 4,
      createdBy: 4,
      status: 'COMPLETED',
      priority: 'HIGH',
      completedAt: new Date('2026-12-10T12:00:00.000Z'),
      dependsOnTaskId: 50,
    });
  });

  describe('Client Review (Tests 1-6)', () => {
    it('1. Client approves own content without creating modification tasks and notifies AM', async () => {
      const res = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'APPROVE' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contentItem.clientReviewStatus).toBe('APPROVED');
      expect(res.body.data.contentItem.clientApprovedAt).toBeTruthy();
      expect(db.tasks.size).toBe(2);
      expect(db.tasks.get(50).status).toBe('COMPLETED');
      expect(db.notifications.some((n) => n.recipientId === 4 && n.type === 'CONTENT_CLIENT_APPROVED')).toBe(true);
    });

    it('2, 5 & 6. Client requests changes -> creates PENDING ChangeRequest, notifies AM, does NOT create Creative task or change CONTENT_CREATION status', async () => {
      const res = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({
          decision: 'REQUEST_CHANGES',
          notes: 'Please change the caption and update the visual.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.contentItem.clientReviewStatus).toBe('CHANGES_REQUESTED');
      expect(res.body.data.changeRequest).toMatchObject({
        contentItemId: 10,
        brandId: 201,
        clientId: 101,
        accountManagerId: 4,
        status: 'PENDING',
        clientNotes: 'Please change the caption and update the visual.',
      });

      // No Creative task created yet and CONTENT_CREATION was NOT set to NEEDS_CHANGES
      expect(db.tasks.size).toBe(2);
      expect(db.tasks.get(50).status).toBe('COMPLETED');
      expect(db.notifications.some((n) => n.recipientId === 4 && n.type === 'CLIENT_CHANGE_REQUEST_CREATED')).toBe(true);
    });

    it('3 & 4. Client cannot review another client content, cannot review NOT_READY content, and cannot directly set task status', async () => {
      const otherClientRes = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', otherClientAuth)
        .send({ decision: 'APPROVE' });
      expect(otherClientRes.status).toBe(403);

      const notReadyRes = await request(app)
        .post('/api/v1/content-items/11/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'APPROVE' });
      expect(notReadyRes.status).toBe(400);

      const missingNotesRes = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'REQUEST_CHANGES' });
      expect(missingNotesRes.status).toBe(400);

      const directTaskStatusRes = await request(app)
        .patch('/api/v1/tasks/50/status')
        .set('Authorization', clientAuth)
        .send({ status: 'NEEDS_CHANGES' });
      expect(directTaskStatusRes.status).toBe(403);
    });
  });

  describe('Account Manager Mediation (Tests 7-14)', () => {
    let changeRequestId;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({
          decision: 'REQUEST_CHANGES',
          notes: 'Update opening frame',
        });
      changeRequestId = res.body.data.changeRequest.id;
      db.notifications = [];
    });

    it('7 & 12. Assigned AM receives request; unrelated AM gets 403; ADMIN can view', async () => {
      const amList = await request(app)
        .get('/api/v1/client-change-requests')
        .set('Authorization', amAuth);
      expect(amList.status).toBe(200);
      expect(amList.body.data.requests.map((r) => r.id)).toEqual([changeRequestId]);

      const otherAmList = await request(app)
        .get('/api/v1/client-change-requests')
        .set('Authorization', otherAmAuth);
      expect(otherAmList.status).toBe(200);
      expect(otherAmList.body.data.requests).toEqual([]);

      const otherAmGet = await request(app)
        .get(`/api/v1/client-change-requests/${changeRequestId}`)
        .set('Authorization', otherAmAuth);
      expect(otherAmGet.status).toBe(403);

      const otherAmResolve = await request(app)
        .patch(`/api/v1/client-change-requests/${changeRequestId}/resolve`)
        .set('Authorization', otherAmAuth)
        .send({ notes: 'Nope' });
      expect(otherAmResolve.status).toBe(403);

      const adminGet = await request(app)
        .get(`/api/v1/client-change-requests/${changeRequestId}`)
        .set('Authorization', adminAuth);
      expect(adminGet.status).toBe(200);
    });

    it('8, 9 & 13. AM resolves request without creating Creative task, notifies client, and resolved request cannot be forwarded', async () => {
      const resolveRes = await request(app)
        .patch(`/api/v1/client-change-requests/${changeRequestId}/resolve`)
        .set('Authorization', amAuth)
        .send({ notes: 'Discussed with client — current cut is approved as-is.' });

      expect(resolveRes.status).toBe(200);
      expect(resolveRes.body.data.changeRequest.status).toBe('RESOLVED');
      expect(resolveRes.body.data.changeRequest.resolvedAt).toBeTruthy();
      expect(resolveRes.body.data.contentItem.clientReviewStatus).toBe('PENDING_CLIENT_REVIEW');

      // No Creative task created
      expect(db.tasks.size).toBe(2);
      expect(db.notifications.some((n) => n.recipientId === 101 && n.type === 'CLIENT_CHANGE_REQUEST_RESOLVED')).toBe(true);

      // Cannot forward already resolved request
      const forwardAfterResolve = await request(app)
        .patch(`/api/v1/client-change-requests/${changeRequestId}/forward`)
        .set('Authorization', amAuth)
        .send({ notes: 'Try forwarding' });
      expect(forwardAfterResolve.status).toBe(400);
    });

    it('10, 11 & 14. AM forwards request -> creates CONTENT_MODIFICATION + REVIEW tasks, notifies Creative, and cannot resolve again', async () => {
      const forwardRes = await request(app)
        .patch(`/api/v1/client-change-requests/${changeRequestId}/forward`)
        .set('Authorization', amAuth)
        .send({ notes: 'Keep music, only swap first 2 seconds.' });

      expect(forwardRes.status).toBe(200);
      expect(forwardRes.body.data.changeRequest.status).toBe('ACCEPTED');
      expect(forwardRes.body.data.changeRequest.forwardedAt).toBeTruthy();
      expect(forwardRes.body.data.contentItem.clientReviewStatus).toBe('IN_MODIFICATION');

      const { modificationTask, reviewTask } = forwardRes.body.data;
      expect(modificationTask.type).toBe('CONTENT_MODIFICATION');
      expect(modificationTask.assignedTo).toBe(7);
      expect(modificationTask.description).toContain('Update opening frame');
      expect(modificationTask.description).toContain('Keep music, only swap first 2 seconds.');
      expect(reviewTask.type).toBe('REVIEW');
      expect(reviewTask.dependsOnTaskId).toBe(modificationTask.id);
      expect(forwardRes.body.data.changeRequest.relatedTaskId).toBe(modificationTask.id);

      // Creative notified
      expect(db.notifications.some((n) => n.recipientId === 7 && n.type === 'TASK_MODIFICATION_ASSIGNED')).toBe(true);

      // Already forwarded request cannot be resolved
      const resolveAfterForward = await request(app)
        .patch(`/api/v1/client-change-requests/${changeRequestId}/resolve`)
        .set('Authorization', amAuth)
        .send({ notes: 'Too late' });
      expect(resolveAfterForward.status).toBe(400);
    });
  });

  describe('Creative Restrictions (Tests 15, 18, 19)', () => {
    it('Creative cannot approve Client Review or view/resolve/forward Client Change Requests', async () => {
      const crRes = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'REQUEST_CHANGES', notes: 'Need brighter text' });
      const crId = crRes.body.data.changeRequest.id;

      const creativeReview = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', creativeAuth)
        .send({ decision: 'APPROVE' });
      expect(creativeReview.status).toBe(403);

      const creativeList = await request(app)
        .get('/api/v1/client-change-requests')
        .set('Authorization', creativeAuth);
      expect(creativeList.status).toBe(403);

      const creativeResolve = await request(app)
        .patch(`/api/v1/client-change-requests/${crId}/resolve`)
        .set('Authorization', creativeAuth)
        .send({});
      expect(creativeResolve.status).toBe(403);

      const creativeForward = await request(app)
        .patch(`/api/v1/client-change-requests/${crId}/forward`)
        .set('Authorization', creativeAuth)
        .send({});
      expect(creativeForward.status).toBe(403);
    });
  });

  describe('Full Multi-Round Loop & Internal Review Integration (Tests 16, 17, 20-24)', () => {
    it('supports multiple rounds: Client Request -> AM Forward -> Creative Submit -> Internal NEEDS_CHANGES -> Resubmit -> Internal COMPLETED -> Client Review #2 -> Request #2 -> Forward -> Submit -> Internal COMPLETED -> Client APPROVE', async () => {
      // === ROUND 1 ===
      const req1 = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'REQUEST_CHANGES', notes: 'Round 1: bigger logo' });
      expect(req1.status).toBe(201);
      const cr1Id = req1.body.data.changeRequest.id;

      const fwd1 = await request(app)
        .patch(`/api/v1/client-change-requests/${cr1Id}/forward`)
        .set('Authorization', amAuth)
        .send({ notes: 'Increase logo by 20%' });
      expect(fwd1.status).toBe(200);
      const modTask1 = fwd1.body.data.modificationTask;
      const revTask1 = fwd1.body.data.reviewTask;

      // Client cannot review while IN_MODIFICATION
      const blockedClientReview = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'APPROVE' });
      expect(blockedClientReview.status).toBe(400);

      // Creative submits modification -> triggers Internal Review
      const sub1 = await request(app)
        .post(`/api/v1/tasks/${modTask1.id}/submit`)
        .set('Authorization', creativeAuth)
        .send({ submissionUrl: 'https://drive.google.com/v2', submissionNotes: 'Logo enlarged' });
      expect(sub1.status).toBe(200);
      expect(db.tasks.get(modTask1.id).status).toBe('SUBMITTED');
      expect(db.tasks.get(revTask1.id).status).toBe('IN_REVIEW');

      // Internal Review requests changes -> ContentItem stays IN_MODIFICATION
      const intNeedsChanges = await request(app)
        .patch(`/api/v1/tasks/${modTask1.id}/review`)
        .set('Authorization', amAuth)
        .send({ decision: 'NEEDS_CHANGES', notes: 'Logo slightly off-center' });
      expect(intNeedsChanges.status).toBe(200);
      expect(db.tasks.get(modTask1.id).status).toBe('NEEDS_CHANGES');
      expect(db.tasks.get(revTask1.id).status).toBe('NEEDS_CHANGES');
      expect(db.contentItems.get(10).clientReviewStatus).toBe('IN_MODIFICATION');

      // Creative resubmits -> Internal Review approves -> back to PENDING_CLIENT_REVIEW
      const sub1b = await request(app)
        .post(`/api/v1/tasks/${modTask1.id}/submit`)
        .set('Authorization', creativeAuth)
        .send({ submissionUrl: 'https://drive.google.com/v2-centered' });
      expect(sub1b.status).toBe(200);
      expect(db.tasks.get(revTask1.id).status).toBe('IN_REVIEW');

      db.notifications = [];
      const intApprove1 = await request(app)
        .patch(`/api/v1/tasks/${modTask1.id}/review`)
        .set('Authorization', amAuth)
        .send({ decision: 'COMPLETED', notes: 'Centered nicely' });
      expect(intApprove1.status).toBe(200);
      expect(db.contentItems.get(10).clientReviewStatus).toBe('PENDING_CLIENT_REVIEW');
      expect(db.notifications.some((n) => n.recipientId === 101 && n.type === 'CONTENT_READY_FOR_CLIENT_REVIEW')).toBe(true);

      // === ROUND 2 ===
      const req2 = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'REQUEST_CHANGES', notes: 'Round 2: adjust end CTA text' });
      expect(req2.status).toBe(201);
      const cr2Id = req2.body.data.changeRequest.id;
      expect(cr2Id).not.toBe(cr1Id);

      const fwd2 = await request(app)
        .patch(`/api/v1/client-change-requests/${cr2Id}/forward`)
        .set('Authorization', amAuth)
        .send({ notes: 'Change CTA to Shop Now' });
      expect(fwd2.status).toBe(200);
      const modTask2 = fwd2.body.data.modificationTask;
      const revTask2 = fwd2.body.data.reviewTask;

      const sub2 = await request(app)
        .post(`/api/v1/tasks/${modTask2.id}/submit`)
        .set('Authorization', creativeAuth)
        .send({ submissionUrl: 'https://drive.google.com/v3' });
      expect(sub2.status).toBe(200);
      expect(db.tasks.get(revTask2.id).status).toBe('IN_REVIEW');

      const intApprove2 = await request(app)
        .patch(`/api/v1/tasks/${modTask2.id}/review`)
        .set('Authorization', amAuth)
        .send({ decision: 'COMPLETED' });
      expect(intApprove2.status).toBe(200);
      expect(db.contentItems.get(10).clientReviewStatus).toBe('PENDING_CLIENT_REVIEW');

      // === FINAL CLIENT APPROVAL ===
      const finalApprove = await request(app)
        .post('/api/v1/content-items/10/client-review')
        .set('Authorization', clientAuth)
        .send({ decision: 'APPROVE' });
      expect(finalApprove.status).toBe(200);
      expect(finalApprove.body.data.contentItem.clientReviewStatus).toBe('APPROVED');
      expect(finalApprove.body.data.contentItem.clientApprovedAt).toBeTruthy();
    });

    it('enforces cross-brand AM isolation on task getById/update/remove and prevents REVIEW bypass via PATCH /:id/status', async () => {
      // Unrelated AM (id 8) cannot view, update, or delete Brand A's task 50
      const getOther = await request(app)
        .get('/api/v1/tasks/50')
        .set('Authorization', otherAmAuth);
      expect(getOther.status).toBe(403);

      const patchOther = await request(app)
        .patch('/api/v1/tasks/50')
        .set('Authorization', otherAmAuth)
        .send({ title: 'Hijack' });
      expect(patchOther.status).toBe(403);

      const deleteOther = await request(app)
        .delete('/api/v1/tasks/50')
        .set('Authorization', otherAmAuth);
      expect(deleteOther.status).toBe(403);

      // Even assigned AM cannot complete a REVIEW task via generic PATCH /:id/status
      db.tasks.get(51).status = 'IN_REVIEW';
      const bypassReview = await request(app)
        .patch('/api/v1/tasks/51/status')
        .set('Authorization', amAuth)
        .send({ status: 'COMPLETED' });
      expect(bypassReview.status).toBe(400);
      expect(bypassReview.body.message).toContain('/review');
    });
  });
});
