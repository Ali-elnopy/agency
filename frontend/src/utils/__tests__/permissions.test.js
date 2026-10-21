import { describe, expect, it } from 'vitest';
import { PERMISSION_GROUPS, RBAC_ROLES } from '../../data/rbac';
import { getCapabilities, getPermission, isAllowed, summarizeRole } from '../permissions';

function capability(id) {
  const match = getCapabilities().find((item) => item.id === id);
  if (!match) throw new Error(`Unknown capability: ${id}`);
  return match;
}

describe('permission matrix', () => {
  it('defines a permission value for every role on every capability', () => {
    for (const group of PERMISSION_GROUPS) {
      for (const item of group.capabilities) {
        for (const role of RBAC_ROLES) {
          expect(item.permissions).toHaveProperty(role.id);
        }
      }
    }
  });

  it('grants the studio lead every capability', () => {
    expect(summarizeRole('admin')).toEqual({ allowed: 8, total: 8 });
  });

  it('blocks user management for creators and clients', () => {
    expect(isAllowed(capability('users'), 'admin')).toBe(true);
    expect(getPermission(capability('users'), 'creator')).toBeNull();
    expect(getPermission(capability('users'), 'client')).toBeNull();
  });

  it('keeps scoped grants distinguishable from full access', () => {
    const scoped = getPermission(capability('billing'), 'director');

    expect(scoped).toMatchObject({ label: expect.any(String), tone: expect.any(String) });
    expect(scoped).not.toBe('allow');
  });

  it('summarizes partial roles without counting scoped grants as full access', () => {
    const creator = summarizeRole('creator');

    expect(creator.total).toBe(8);
    expect(creator.allowed).toBe(2);
    expect(creator.allowed).toBeLessThan(creator.total);
  });
});
