import { beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const mocks = vi.hoisted(() => ({
  users: new Map(),
  nextTaskId: 20,
  lastListWhere: null,
  tasksList: null,
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

vi.mock('./tasks.model.js', () => {
  function matchesCondition(task, cond) {
    if (!cond || Object.keys(cond).length === 0) return true;
    if (cond.AND) {
      return cond.AND.every((sub) => matchesCondition(task, sub));
    }
    if (cond.OR) {
      return cond.OR.some((sub) => matchesCondition(task, sub));
    }
    if (cond.assignedTo !== undefined && task.assignedTo !== cond.assignedTo) {
      return false;
    }
    if (cond.createdBy !== undefined && task.createdBy !== cond.createdBy) {
      return false;
    }
    if (cond.contentItemId !== undefined && task.contentItemId !== cond.contentItemId) {
      return false;
    }
    if (cond.contentItem?.contentPlan?.brand?.accountManagerId !== undefined) {
      const amId = cond.contentItem.contentPlan.brand.accountManagerId;
      if (task.contentItem?.contentPlan?.brand?.accountManagerId !== amId) {
        return false;
      }
    }
    return true;
  }

  return {
    TasksModel: {
      create: async (data) => ({ id: mocks.nextTaskId++, ...data }),
      list: async (where) => {
        mocks.lastListWhere = where;
        if (mocks.tasksList) {
          return mocks.tasksList.filter((task) => matchesCondition(task, where));
        }
        return [];
      },
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
        role: { name: id === 4 || id === 8 ? 'ACCOUNT_MANAGER' : id === 6 ? 'CLIENT' : 'EMPLOYEE' },
      }),
      findContentItemById: async (id) => ({
        id: Number(id),
        title: 'Test item',
        type: 'POST',
        scheduledDate: new Date(Date.now() + 86_400_000),
        createdBy: 2,
        contentPlan: { brand: { accountManagerId: Number(id) === 98 ? 8 : 4 } },
      }),
      findExistingWorkflowTasks: async () => [],
      findDeadlineRule: async (_contentType, taskType) => ({
        isActive: true,
        offsetMinutes: taskType === 'REVIEW' ? 120 : 60,
      }),
    },
  };
});

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
    expect(assign.status).toBe(isManager ? 201 : 403);
    expect(remove.status).toBe(isManager ? 200 : 403);
  });

  describe('GET /api/tasks scoping & authorization', () => {
    const sampleTasks = [
      {
        id: 101,
        title: 'Task on AM4 Brand',
        assignedTo: 2,
        createdBy: 4,
        contentItem: { contentPlan: { brand: { accountManagerId: 4 } } },
      },
      {
        id: 102,
        title: 'Task on AM8 Brand',
        assignedTo: 5,
        createdBy: 8,
        contentItem: { contentPlan: { brand: { accountManagerId: 8 } } },
      },
      {
        id: 103,
        title: 'Direct task for AM4',
        assignedTo: 4,
        createdBy: 1,
        contentItem: null,
      },
      {
        id: 104,
        title: 'Task on AM8 Brand assigned to Employee 2',
        assignedTo: 2,
        createdBy: 8,
        contentItem: { contentPlan: { brand: { accountManagerId: 8 } } },
      },
    ];

    beforeEach(() => {
      mocks.tasksList = sampleTasks;
      mocks.lastListWhere = null;
    });

    it('1. Admin can list all tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', authHeader({ role: 'ADMIN', id: 1 }));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks).toHaveLength(4);
      expect(mocks.lastListWhere).toEqual({});
    });

    it('2. Account Manager cannot see another Account Manager\'s brand tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', authHeader({ role: 'ACCOUNT_MANAGER', id: 4 }));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const taskIds = res.body.data.tasks.map((t) => t.id);
      expect(taskIds).not.toContain(102);
      expect(taskIds).not.toContain(104);
    });

    it('3. Account Manager can see tasks related to their own brands', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', authHeader({ role: 'ACCOUNT_MANAGER', id: 4 }));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const taskIds = res.body.data.tasks.map((t) => t.id);
      expect(taskIds).toContain(101);
      expect(taskIds).toContain(103);
    });

    it('4. Employee can see only their assigned tasks', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', authHeader({ role: 'EMPLOYEE', id: 2 }));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const taskIds = res.body.data.tasks.map((t) => t.id);
      expect(taskIds).toEqual([101, 104]);
      expect(taskIds).not.toContain(102);
      expect(taskIds).not.toContain(103);
    });

    it('5. Employee cannot bypass isolation using ?assignedTo=999', async () => {
      const res = await request(app)
        .get('/api/tasks?assignedTo=999')
        .set('Authorization', authHeader({ role: 'EMPLOYEE', id: 2 }));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const taskIds = res.body.data.tasks.map((t) => t.id);
      expect(taskIds).toEqual([101, 104]);
      expect(mocks.lastListWhere).toEqual({
        AND: [
          {},
          { assignedTo: 2 },
        ],
      });
    });

    it('6. Employee cannot bypass isolation using ?createdBy=999', async () => {
      const res = await request(app)
        .get('/api/tasks?createdBy=999')
        .set('Authorization', authHeader({ role: 'EMPLOYEE', id: 2 }));

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tasks).toEqual([]);
      expect(mocks.lastListWhere).toEqual({
        AND: [
          { createdBy: 999 },
          { assignedTo: 2 },
        ],
      });
    });

    it('7. Client receives 403', async () => {
      const res = await request(app)
        .get('/api/tasks')
        .set('Authorization', authHeader({ role: 'CLIENT', id: 6 }));

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/tasks/content-items/:contentItemId/assign brand isolation & authorization', () => {
    it('1. Admin can assign tasks to any Content Item', async () => {
      // Content Item 9 belongs to AM 4
      const res1 = await request(app)
        .post('/api/tasks/content-items/9/assign')
        .set('Authorization', authHeader({ role: 'ADMIN', id: 1 }))
        .send({});
      expect(res1.status).toBe(201);
      expect(res1.body.success).toBe(true);

      // Content Item 98 belongs to AM 8
      const res2 = await request(app)
        .post('/api/tasks/content-items/98/assign')
        .set('Authorization', authHeader({ role: 'ADMIN', id: 1 }))
        .send({});
      expect(res2.status).toBe(201);
      expect(res2.body.success).toBe(true);
    });

    it('2. Account Manager can assign tasks to a Content Item belonging to their Brand', async () => {
      // AM 4 assigning to Content Item 9 (Brand has accountManagerId = 4)
      const res = await request(app)
        .post('/api/tasks/content-items/9/assign')
        .set('Authorization', authHeader({ role: 'ACCOUNT_MANAGER', id: 4 }))
        .send({});
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('3. Account Manager receives 403 when assigning to another Account Manager\'s Brand', async () => {
      // AM 4 assigning to Content Item 98 (Brand has accountManagerId = 8)
      const res = await request(app)
        .post('/api/tasks/content-items/98/assign')
        .set('Authorization', authHeader({ role: 'ACCOUNT_MANAGER', id: 4 }))
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('assigned brands');
    });

    it('4. Employee cannot assign workflow tasks', async () => {
      const res = await request(app)
        .post('/api/tasks/content-items/9/assign')
        .set('Authorization', authHeader({ role: 'EMPLOYEE', id: 2 }))
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('5. Client cannot assign workflow tasks', async () => {
      const res = await request(app)
        .post('/api/tasks/content-items/9/assign')
        .set('Authorization', authHeader({ role: 'CLIENT', id: 6 }))
        .send({});
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('6. Verify authorization is based on Content Item\'s actual Brand ownership, not request body', async () => {
      // AM 4 attempts to assign valid assignees/reviewers to item 98 (which belongs to AM 8's brand)
      const res = await request(app)
        .post('/api/tasks/content-items/98/assign')
        .set('Authorization', authHeader({ role: 'ACCOUNT_MANAGER', id: 4 }))
        .send({
          creationAssigneeId: 2,
          reviewerId: 4,
        });
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('assigned brands');
    });
  });
});
