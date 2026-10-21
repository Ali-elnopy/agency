import { ApiError, apiRequest } from './http';
import { isMockApiEnabled } from './api';
import { getAccessToken } from './tokenStorage';
import { DIRECTORY_STATS, DIRECTORY_USERS } from '../data/users';
import { RBAC_ROLES } from '../data/rbac';

/**
 * Directory service. The shapes below are the contract the backend is expected
 * to implement; until it exists, mock mode serves the same shapes from local
 * fixtures so the screens behave identically.
 *
 *   GET    /users?status=&query=   -> { users, stats }
 *   PATCH  /users/:id              -> user
 *   POST   /users/:id/deactivate   -> user
 *   POST   /users/me/password      -> { success }
 */

const MOCK_LATENCY = 350;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function canUseMock(error) {
  const isDevSession =
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
    getAccessToken() === 'dev-bypass-token';

  // A development session always resolves from fixtures, whatever the backend
  // (or the mock flag) says, so browsing never hits a real API or logs out.
  if (isDevSession) return true;

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

const mockUsers = DIRECTORY_USERS.map((user) => ({
  ...user,
  roleId: roleIdFor(user.role),
  phone: user.id === 'u-001' ? '+1 (555) 349-8120' : '',
  addedAt: 'Oct 12, 2026',
  suspended: false,
}));

const profileOverrides = new Map();

export async function getUsers() {
  try {
    const data = unwrap(await apiRequest('/users'));
    return {
      users: data?.users ?? [],
      stats: data?.stats ?? DIRECTORY_STATS,
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

export async function updateUser(id, patch) {
  try {
    return unwrap(
      await apiRequest(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch }),
    );
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
    return unwrap(
      await apiRequest(`/users/${encodeURIComponent(id)}/deactivate`, {
        method: 'POST',
        body: { reason, reassignTo },
      }),
    );
  } catch (error) {
    if (!canUseMock(error)) throw error;

    await sleep(MOCK_LATENCY);

    const index = mockUsers.findIndex((user) => user.id === id);
    if (index === -1) throw new ApiError('User not found.', 404);

    mockUsers[index] = {
      ...mockUsers[index],
      status: 'deactivated',
      role: `${mockUsers[index].role.replace(' (Revoked)', '')} (Revoked)`,
      roleHint: 'Access reclaimed • Tokens invalidated',
      brands: [],
      deactivationReason: reason ?? '',
      reassignedTo: reassignTo ?? '',
    };

    return { ...mockUsers[index] };
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    return unwrap(
      await apiRequest('/users/me/password', {
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
