import { describe, it, expect, vi } from 'vitest';
import { requirePermission } from '../src/middlewares/requirePermission.js';
import {
  createUserSchema,
  updateUserSchema,
  EMPLOYEE_PERMISSIONS,
} from '../src/modules/users/users.validation.js';

describe('requirePermission middleware', () => {
  it('allows ADMIN with full access bypass regardless of permissions', async () => {
    const middleware = requirePermission('CREATE_CONTENT');
    const req = {
      user: {
        id: 1,
        role: { name: 'ADMIN' },
        permissions: [],
      },
    };
    const res = {};
    let nextCalled = false;
    let nextError = null;

    middleware(req, res, (err) => {
      nextCalled = true;
      nextError = err;
    });

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
  });

  it('allows EMPLOYEE when the required permission is in UserPermission', async () => {
    const middleware = requirePermission('CREATE_CONTENT');
    const req = {
      user: {
        id: 2,
        role: { name: 'EMPLOYEE' },
        permissions: [{ permission: { code: 'CREATE_CONTENT' } }],
      },
    };
    const res = {};
    let nextCalled = false;
    let nextError = null;

    middleware(req, res, (err) => {
      nextCalled = true;
      nextError = err;
    });

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
  });

  it('denies EMPLOYEE (403) when user lacks the required UserPermission', async () => {
    const middleware = requirePermission('CREATE_CONTENT');
    const req = {
      user: {
        id: 2,
        role: { name: 'EMPLOYEE' },
        permissions: [{ permission: { code: 'REVIEW_CONTENT' } }],
      },
    };
    const res = {};
    let nextError = null;

    middleware(req, res, (err) => {
      nextError = err;
    });

    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(403);
    expect(nextError.message).toContain('Permission denied');
  });

  it('allows ACCOUNT_MANAGER when permission is in RolePermission', async () => {
    const middleware = requirePermission('MANAGE_CONTENT');
    const req = {
      user: {
        id: 3,
        role: {
          name: 'ACCOUNT_MANAGER',
          permissions: [{ permission: { code: 'MANAGE_CONTENT' } }],
        },
      },
    };
    const res = {};
    let nextCalled = false;
    let nextError = null;

    middleware(req, res, (err) => {
      nextCalled = true;
      nextError = err;
    });

    expect(nextCalled).toBe(true);
    expect(nextError).toBeUndefined();
  });

  it('denies ACCOUNT_MANAGER (403) when role lacks RolePermission', async () => {
    const middleware = requirePermission('CREATE_CONTENT');
    const req = {
      user: {
        id: 3,
        role: {
          name: 'ACCOUNT_MANAGER',
          permissions: [{ permission: { code: 'MANAGE_CONTENT' } }],
        },
      },
    };
    const res = {};
    let nextError = null;

    middleware(req, res, (err) => {
      nextError = err;
    });

    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(403);
  });

  it('allows CLIENT when permission is in RolePermission', async () => {
    const middleware = requirePermission('REVIEW_CONTENT');
    const req = {
      user: {
        id: 4,
        role: {
          name: 'CLIENT',
          permissions: [{ permission: { code: 'REVIEW_CONTENT' } }],
        },
      },
    };
    const res = {};
    let nextCalled = false;

    middleware(req, res, (err) => {
      if (!err) nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it('supports multi-permission requirements (OR logic)', async () => {
    const middleware = requirePermission('REVIEW_CONTENT', 'MANAGE_CONTENT');
    const req = {
      user: {
        id: 5,
        role: { name: 'EMPLOYEE' },
        permissions: [{ permission: { code: 'MANAGE_CONTENT' } }],
      },
    };
    let nextCalled = false;

    middleware(req, {}, (err) => {
      if (!err) nextCalled = true;
    });

    expect(nextCalled).toBe(true);
  });

  it('returns 401 when no authenticated user is present', async () => {
    const middleware = requirePermission('CREATE_CONTENT');
    let nextError = null;

    middleware({}, {}, (err) => {
      nextError = err;
    });

    expect(nextError).toBeDefined();
    expect(nextError.statusCode).toBe(401);
  });
});

describe('User Creation & Update Permission Validation', () => {
  it('blocks ADMIN creation in createUserSchema', () => {
    const result = createUserSchema.safeParse({
      fullName: 'Test Admin',
      email: 'admin.new@agency.local',
      password: 'StrongPassword123!',
      roleName: 'ADMIN',
    });

    expect(result.success).toBe(false);
  });

  it('blocks legacy TEAM_LEADER role in createUserSchema', () => {
    const result = createUserSchema.safeParse({
      fullName: 'Team Leader',
      email: 'tl@agency.local',
      password: 'StrongPassword123!',
      roleName: 'TEAM_LEADER',
    });

    expect(result.success).toBe(false);
  });

  it('allows valid EMPLOYEE creation with allowed employee permissions', () => {
    const result = createUserSchema.safeParse({
      fullName: 'Jane Doe',
      email: 'jane@agency.local',
      password: 'StrongPassword123!',
      roleName: 'EMPLOYEE',
      permissions: ['CREATE_CONTENT', 'MANAGE_CONTENT'],
    });

    expect(result.success).toBe(true);
  });

  it('rejects employee creation with invalid permission codes', () => {
    const result = createUserSchema.safeParse({
      fullName: 'Jane Doe',
      email: 'jane@agency.local',
      password: 'StrongPassword123!',
      roleName: 'EMPLOYEE',
      permissions: ['INVALID_PERMISSION'],
    });

    expect(result.success).toBe(false);
  });

  it('rejects permissions on non-EMPLOYEE (e.g. ACCOUNT_MANAGER)', () => {
    const result = createUserSchema.safeParse({
      fullName: 'AM User',
      email: 'am@agency.local',
      password: 'StrongPassword123!',
      roleName: 'ACCOUNT_MANAGER',
      permissions: ['CREATE_CONTENT'],
    });

    expect(result.success).toBe(false);
  });

  it('rejects permissions on non-EMPLOYEE (e.g. CLIENT)', () => {
    const result = createUserSchema.safeParse({
      fullName: 'Client User',
      email: 'client@agency.local',
      password: 'StrongPassword123!',
      roleName: 'CLIENT',
      permissions: ['CREATE_CONTENT'],
    });

    expect(result.success).toBe(false);
  });

  it('verifies EMPLOYEE_PERMISSIONS constant contains exactly the 4 required permissions', () => {
    expect(EMPLOYEE_PERMISSIONS).toEqual([
      'CREATE_CONTENT',
      'MANAGE_CONTENT',
      'REVIEW_CONTENT',
      'PUBLISH_CONTENT',
    ]);
  });
});

describe('UsersService permission enforcement', () => {
  it('blocks creating ADMIN in UsersService.createUser', async () => {
    const { UsersService } = await import('../src/modules/users/users.service.js');
    await expect(
      UsersService.createUser({ roleName: 'ADMIN' }, 1),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  it('blocks assigning permissions to non-EMPLOYEE in UsersService.createUser', async () => {
    const { UsersService } = await import('../src/modules/users/users.service.js');
    await expect(
      UsersService.createUser({ roleName: 'ACCOUNT_MANAGER', permissions: ['CREATE_CONTENT'] }, 1),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});
