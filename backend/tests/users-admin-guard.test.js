import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Rules under test: the workspace always keeps at least one active admin.
 * The model layer is replaced with an in-memory fake so no database is needed.
 */
const state = {
  user: null,
  otherActiveAdmins: 0,
  updated: [],
  deactivated: [],
  deleted: [],
  counted: [],
};

vi.mock('../src/modules/users/users.model.js', () => ({
  UsersModel: {
    findById: async () => state.user,
    countActiveAdmins: async (args) => {
      state.counted.push(args);
      return state.otherActiveAdmins;
    },
    update: async (id, data) => {
      state.updated.push({ id, data });
      return { id, ...data, role: state.user?.role };
    },
    deactivate: async (id) => {
      state.deactivated.push(id);
      return { id, isActive: false };
    },
    delete: async (id) => {
      state.deleted.push(id);
      return { id };
    },
    findRoleByName: async (name) => ({ id: 3, name }),
    findJobTitleById: async (id) => ({ id, name: 'Content Creator', isActive: true }),
    findJobTitleByName: async () => ({ id: 1, name: 'Account Manager', isActive: true }),
  },
}));

const { UsersService } = await import('../src/modules/users/users.service.js');

const admin = { id: 1, isActive: true, role: { id: 1, name: 'ADMIN' }, jobTitle: null };
const employee = {
  id: 2,
  isActive: true,
  role: { id: 3, name: 'EMPLOYEE' },
  jobTitle: { id: 5, name: 'Content Creator' },
};

beforeEach(() => {
  state.user = null;
  state.otherActiveAdmins = 0;
  state.updated = [];
  state.deactivated = [];
  state.deleted = [];
  state.counted = [];
});

describe('editing an administrator', () => {
  it('accepts profile-only changes', async () => {
    state.user = admin;

    await UsersService.updateUser(1, { fullName: 'New Name', phone: '0100' });

    expect(state.updated).toHaveLength(1);
    expect(state.updated[0].data).toEqual({ fullName: 'New Name', phone: '0100' });
    expect(state.counted).toHaveLength(0);
  });

  it('refuses to change the administrator role', async () => {
    state.user = admin;

    await expect(UsersService.updateUser(1, { roleName: 'EMPLOYEE' })).rejects.toMatchObject({
      statusCode: 409,
    });

    expect(state.updated).toHaveLength(0);
  });

  it('refuses to repurpose an admin account as an employee profile', async () => {
    state.user = admin;

    await expect(UsersService.updateUser(1, { jobTitleId: 5 })).rejects.toMatchObject({
      statusCode: 400,
    });

    expect(state.updated).toHaveLength(0);
  });
});

describe('removing an administrator', () => {
  it('blocks deactivating the last active admin', async () => {
    state.user = admin;
    state.otherActiveAdmins = 0;

    await expect(UsersService.deactivateUser(1)).rejects.toMatchObject({ statusCode: 409 });

    expect(state.deactivated).toHaveLength(0);
    expect(state.counted).toEqual([{ excludeId: 1 }]);
  });

  it('allows deactivating an admin when another active admin remains', async () => {
    state.user = admin;
    state.otherActiveAdmins = 1;

    await UsersService.deactivateUser(1);

    expect(state.deactivated).toEqual([1]);
  });

  it('blocks deleting the last active admin', async () => {
    state.user = admin;
    state.otherActiveAdmins = 0;

    await expect(UsersService.deleteUser(1)).rejects.toMatchObject({ statusCode: 409 });

    expect(state.deleted).toHaveLength(0);
  });

  it('allows deleting an already-inactive admin', async () => {
    state.user = { ...admin, isActive: false };

    await UsersService.deleteUser(1);

    expect(state.deleted).toEqual([1]);
    expect(state.counted).toHaveLength(0);
  });
});

describe('regular users', () => {
  it('never runs the admin count', async () => {
    state.user = employee;

    await UsersService.deactivateUser(2);

    expect(state.deactivated).toEqual([2]);
    expect(state.counted).toHaveLength(0);
  });

  it('still supports role changes between the manageable roles', async () => {
    state.user = employee;

    await UsersService.updateUser(2, { roleName: 'ACCOUNT_MANAGER' });

    expect(state.updated).toHaveLength(1);
    expect(state.updated[0].data.roleId).toBe(3);
    expect(state.updated[0].data.jobTitleId).toBe(1);
  });
});
