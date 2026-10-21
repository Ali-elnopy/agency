import { PERMISSION_GROUPS } from '../data/rbac';

/**
 * Permission values are `'allow'`, `null`, or a scoped `{ label, tone }` grant.
 * Keeping the lookup in one place makes the matrix renderer and the tests agree.
 */

export function getPermission(capability, roleId) {
  return capability?.permissions?.[roleId] ?? null;
}

export function isAllowed(capability, roleId) {
  return getPermission(capability, roleId) === 'allow';
}

export function getCapabilities() {
  return PERMISSION_GROUPS.flatMap((group) => group.capabilities);
}

export function summarizeRole(roleId) {
  const capabilities = getCapabilities();
  const allowed = capabilities.filter((capability) => isAllowed(capability, roleId)).length;

  return { allowed, total: capabilities.length };
}
