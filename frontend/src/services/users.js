import { ApiError, apiRequest } from './http';
import { isMockApiEnabled } from './api';
import { getAccessToken } from './tokenStorage';
import { DIRECTORY_STATS, DIRECTORY_USERS } from '../data/users';
import { RBAC_ROLES } from '../data/rbac';

/**
 * Directory service. It talks to the Express API and maps the backend records
 * onto the shape the screens already render.
 *
 *   GET    /users                  -> { users, stats }
 *   GET    /users/:id              -> user
 *   POST   /users                  -> user
 *   PATCH  /users/:id              -> user
 *   POST   /users/:id/deactivate   -> user
 *   POST   /users/:id/reactivate   -> user
 *   DELETE /users/:id              -> { id }
 *   POST   /auth/change-password   -> { message }
 *
 * When the app runs in the local demo mode (dev bypass or mock API) the same
 * functions resolve from the fixtures so the single-file demo keeps working.
 */

const MOCK_LATENCY = 350;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isDevSession() {
  return (
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
    getAccessToken() === 'dev-bypass-token'
  );
}

/**
 * The single-file demo build has no server. Resolve straight from fixtures so
 * the bundle never fires failing requests (which would clutter the console).
 */
async function request(path, options) {
  if (isDevSession()) throw new ApiError('Local demo mode', 0);

  return apiRequest(path, options);
}

function canUseMock(error) {
  // A development session always resolves from fixtures, whatever the backend
  // (or the mock flag) says, so browsing never hits a real API or logs out.
  if (isDevSession()) return true;

  return (
    isMockApiEnabled() && error instanceof ApiError && (error.status === 0 || error.status >= 500)
  );
}

function unwrap(body) {
  return body?.data ?? body;
}

function roleIdFor(roleName) {
  const match = RBAC_ROLES.find((role) => roleName?.startsWith(role.name));
  return match?.id ?? 'creator';
}

/* ------------------------------------------------------ backend -> screen */

const BACKEND_ROLE_TO_UI = {
  ADMIN: 'admin',
  ACCOUNT_MANAGER: 'director',
  EMPLOYEE: 'creator',
};

const UI_ROLE_TO_BACKEND = {
  admin: 'ADMIN',
  director: 'ACCOUNT_MANAGER',
  creator: 'EMPLOYEE',
};

const ROLE_HINTS = {
  ADMIN: 'Full governance • Users, roles & billing',
  ACCOUNT_MANAGER: 'Client portfolios • Brief approvals',
  EMPLOYEE: 'Production • Edit & draft',
};

const ROLE_TONES = {
  ADMIN: 'orange',
  ACCOUNT_MANAGER: 'purple',
  EMPLOYEE: 'blue',
};

const AVATAR_TONES = ['orange', 'purple', 'blue', 'muted'];

export function initialsOf(name = '') {
  return String(name)
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
}

function toneFor(name = '') {
  const seed = String(name)
    .split('')
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  return AVATAR_TONES[seed % AVATAR_TONES.length];
}

function formatDate(value) {
  if (!value) return '';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function displayRole(roleName, jobTitleName) {
  if (roleName === 'ADMIN') return 'Studio Lead & Admin';
  if (roleName === 'ACCOUNT_MANAGER') return 'Account Manager';
  return jobTitleName || 'Team Member';
}

export function mapUser(user) {
  if (!user) return null;

  const roleName = user.role?.name ?? 'EMPLOYEE';
  const jobTitleName = user.jobTitle?.name ?? '';

  return {
    id: user.id,
    name: user.fullName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone ?? '',
    roleId: BACKEND_ROLE_TO_UI[roleName] ?? roleIdFor('Creator & Copywriter'),
    role: displayRole(roleName, jobTitleName),
    roleHint: ROLE_HINTS[roleName] ?? '',
    backendRole: roleName,
    jobTitleId: user.jobTitle?.id ?? null,
    jobTitleName,
    type: 'Internal',
    typeTone: ROLE_TONES[roleName] ?? 'muted',
    avatarTone: toneFor(user.fullName),
    initials: initialsOf(user.fullName),
    brands: [],
    status: user.isActive === false ? 'deactivated' : 'active',
    suspended: user.isActive === false,
    addedAt: formatDate(user.createdAt),
    createdAt: user.createdAt ?? null,
    lastLoginAt: user.lastLoginAt ?? null,
  };
}

/* -------------------------------------------------------------- fixtures */

const mockUsers = DIRECTORY_USERS.map((user) => ({
  ...user,
  roleId: roleIdFor(user.role),
  phone: user.id === 'u-001' ? '+1 (555) 349-8120' : '',
  addedAt: 'Oct 12, 2026',
  suspended: false,
}));

const profileOverrides = new Map();

/* ----------------------------------------------------------- live cache */

// The edit form only sends a role id, so remember the last directory payload
// to resolve the current role/job title without another round-trip.
const directoryCache = new Map();
let jobTitleIndex = new Map();

function remember(user) {
  if (Number.isSafeInteger(user?.id) && user.id > 0) directoryCache.set(user.id, user);
  return user;
}

function indexJobTitles(users) {
  const next = new Map();

  for (const user of users) {
    if (user.jobTitle?.id && user.jobTitle?.name) {
      next.set(user.jobTitle.name, user.jobTitle.id);
    }
  }

  if (next.size) jobTitleIndex = next;

  return next;
}

/* ------------------------------------------------------------- endpoints */

export async function getUsers({ status, query } = {}) {
  try {
    const params = new URLSearchParams();

    if (status) params.set('status', status);
    if (query) params.set('query', query);

    const suffix = params.toString() ? `?${params.toString()}` : '';
    const data = unwrap(await request(`/users${suffix}`));
    const records = Array.isArray(data?.users) ? data.users : [];
    const users = records.map(mapUser);

    indexJobTitles(records);
    users.forEach(remember);

    return {
      users,
      stats: data?.stats ?? { total: users.length, active: users.length, suspended: 0 },
    };
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await sleep(MOCK_LATENCY);
    return {
      users: mockUsers.map((user) => ({ ...user })),
      stats: { ...DIRECTORY_STATS },
    };
  }
}

export async function getUser(id) {
  const cached = directoryCache.get(Number(id));

  if (cached) return cached;

  try {
    const data = unwrap(await request(`/users/${encodeURIComponent(id)}`));

    return remember(mapUser(data));
  } catch (error) {
    if (!canUseMock(error)) throw error;

    const fallback = mockUsers.find((user) => user.id === Number(id));

    if (!fallback) throw error;

    return { ...fallback };
  }
}

export async function getJobTitles() {
  if (!jobTitleIndex.size) {
    await getUsers().catch(() => null);
  }

  return [...jobTitleIndex.entries()].map(([name, id]) => ({ id, name }));
}

function resolveJobTitleId(name) {
  const match = jobTitleIndex.get(name);

  if (match) return match;

  const fromEnv = Number(import.meta.env.VITE_JOB_TITLE_CONTENT_CREATOR);

  return Number.isSafeInteger(fromEnv) && fromEnv > 0 ? fromEnv : null;
}

export async function createUser({ fullName, email, phone, password, roleName, jobTitleId }) {
  try {
    const data = unwrap(
      await request('/users', {
        method: 'POST',
        body: {
          fullName,
          email,
          phone: phone || null,
          password,
          roleName,
          jobTitleId: jobTitleId ?? null,
        },
      }),
    );

    return remember(mapUser(data));
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await sleep(MOCK_LATENCY);

    const created = mapUser({
      id: `u-${Date.now()}`,
      fullName,
      email,
      phone,
      isActive: true,
      createdAt: new Date().toISOString(),
      role: { name: roleName },
      jobTitle: jobTitleId ? { id: jobTitleId, name: 'Team Member' } : null,
    });

    mockUsers.unshift(created);

    return created;
  }
}

function buildUpdateBody(patch, current) {
  const body = {};
  const name = patch.name ?? patch.fullName;

  if (name !== undefined) body.fullName = String(name).trim();
  if (patch.email !== undefined) body.email = String(patch.email).trim().toLowerCase();
  if (patch.phone !== undefined) body.phone = String(patch.phone).trim() || null;

  const nextRoleId = patch.roleId;

  if (nextRoleId && nextRoleId !== current?.roleId) {
    if (nextRoleId === 'admin') {
      throw new ApiError(
        'Workspace Admin accounts are provisioned by the platform and cannot be reassigned here.',
        400,
      );
    }

    if (nextRoleId === 'client') {
      throw new ApiError('Client Reviewer accounts are not supported by the API yet.', 400);
    }

    const roleName = UI_ROLE_TO_BACKEND[nextRoleId];

    if (!roleName) {
      throw new ApiError('That workspace role is not supported by the API.', 400);
    }

    body.roleName = roleName;

    if (roleName === 'EMPLOYEE' && !patch.jobTitleId) {
      const jobTitleId = resolveJobTitleId('Content Creator');

      if (!jobTitleId) {
        throw new ApiError(
          'A Content Creator job title is required. Ask an administrator to configure job titles first.',
          400,
        );
      }

      body.jobTitleId = jobTitleId;
    }
  }

  if (patch.jobTitleId && !body.jobTitleId) body.jobTitleId = patch.jobTitleId;

  return body;
}

export async function updateUser(id, patch) {
  try {
    const numericId = Number(id);
    let current = directoryCache.get(numericId);

    // Account status has dedicated endpoints. Only treat `suspended: false` as
    // a reactivation when the account is actually deactivated, otherwise every
    // profile save would be swallowed by the status branch.
    const wantsReactivate =
      patch.status === 'active' ||
      (patch.suspended === false && current?.status === 'deactivated');

    if (wantsReactivate && current && current.status !== 'active') {
      const data = unwrap(
        await request(`/users/${encodeURIComponent(id)}/reactivate`, { method: 'POST' }),
      );

      current = remember(mapUser(data));
    } else if (patch.suspended === true && (!current || current.status === 'active')) {
      const data = unwrap(
        await request(`/users/${encodeURIComponent(id)}/deactivate`, { method: 'POST' }),
      );

      current = remember(mapUser(data));
    }

    const profilePatch = { ...patch };

    delete profilePatch.status;
    delete profilePatch.suspended;
    delete profilePatch.role;
    delete profilePatch.roleHint;
    delete profilePatch.brands;

    const body = buildUpdateBody(profilePatch, current);

    if (Object.keys(body).length === 0) {
      return current ?? { id };
    }

    if (current?.backendRole === 'ADMIN') {
      throw new ApiError(
        'Administrator accounts cannot be edited through the user directory.',
        403,
      );
    }

    const data = unwrap(
      await request(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body }),
    );

    return remember(mapUser(data));
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await sleep(MOCK_LATENCY);

    const index = mockUsers.findIndex((user) => user.id === id);

    // The signed-in account is not necessarily part of the directory.
    if (index === -1) {
      const merged = { id, ...(profileOverrides.get(id) ?? {}), ...patch };
      profileOverrides.set(id, merged);
      return merged;
    }

    mockUsers[index] = { ...mockUsers[index], ...patch };
    return { ...mockUsers[index] };
  }
}

export async function deactivateUser(id, { reason, reassignTo } = {}) {
  try {
    const data = unwrap(
      await request(`/users/${encodeURIComponent(id)}/deactivate`, { method: 'POST' }),
    );

    return remember(mapUser(data));
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await sleep(MOCK_LATENCY);

    const index = mockUsers.findIndex((user) => user.id === id);
    if (index === -1) throw new ApiError('User not found.', 404);

    mockUsers[index] = {
      ...mockUsers[index],
      status: 'deactivated',
      suspended: true,
      role: `${mockUsers[index].role.replace(' (Revoked)', '')} (Revoked)`,
      roleHint: 'Access reclaimed • Tokens invalidated',
      brands: [],
      deactivationReason: reason ?? '',
      reassignedTo: reassignTo ?? '',
    };

    return { ...mockUsers[index] };
  }
}

export async function reactivateUser(id) {
  return updateUser(id, { status: 'active', suspended: false });
}

export async function deleteUser(id) {
  const data = unwrap(await apiRequest(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' }));

  directoryCache.delete(Number(id));

  return data;
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    return unwrap(
      await request('/auth/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      }),
    );
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await sleep(MOCK_LATENCY);
    return { success: true };
  }
}
