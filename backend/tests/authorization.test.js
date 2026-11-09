import { describe, expect, it } from 'vitest';
import {
  brandScopeWhere,
  contentPlanScopeWhere,
  isContentCreator,
  platformAccountScopeWhere,
  requireRoles,
} from '../src/middlewares/authorization.js';

describe('role and resource access policies', () => {
  const admin = { id: 1, role: { name: 'ADMIN' }, jobTitle: null };
  const manager = { id: 12, role: { name: 'ACCOUNT_MANAGER' } };
  const client = { id: 24, role: { name: 'CLIENT' } };
  const creator = {
    id: 36,
    role: { name: 'EMPLOYEE' },
    jobTitle: { name: 'Content Creator' },
  };

  it('recognizes Content Creator only as an EMPLOYEE with the matching job title', () => {
    expect(isContentCreator(creator)).toBe(true);
    expect(isContentCreator({ ...creator, role: { name: 'TEAM_LEADER' } })).toBe(false);
    expect(isContentCreator({ ...creator, jobTitle: { name: 'Graphic Designer' } })).toBe(false);
  });

  it('scopes brands to the account manager, client, or assigned creator', () => {
    expect(brandScopeWhere(admin)).toEqual({});
    expect(brandScopeWhere(manager)).toEqual({ accountManagerId: 12 });
    expect(brandScopeWhere(client)).toEqual({ clientId: 24 });
    expect(brandScopeWhere(creator)).toEqual({ contentPlans: { some: { assignedToId: 36 } } });
  });

  it('scopes content plans to managed brands, owned brand, or direct assignment', () => {
    expect(contentPlanScopeWhere(admin)).toEqual({});
    expect(contentPlanScopeWhere(manager)).toEqual({ brand: { is: { accountManagerId: 12 } } });
    expect(contentPlanScopeWhere(client)).toEqual({ brand: { is: { clientId: 24 } } });
    expect(contentPlanScopeWhere(creator)).toEqual({ assignedToId: 36 });
  });

  it('scopes platform accounts through the related brand or assigned plans', () => {
    expect(platformAccountScopeWhere(manager)).toEqual({ brand: { is: { accountManagerId: 12 } } });
    expect(platformAccountScopeWhere(client)).toEqual({ brand: { is: { clientId: 24 } } });
    expect(platformAccountScopeWhere(creator)).toEqual({ contentPlans: { some: { assignedToId: 36 } } });
  });

  it('supports the virtual CONTENT_CREATOR authorization role', () => {
    let error;
    let proceeded = false;
    requireRoles('ADMIN', 'CONTENT_CREATOR')(
      { user: creator },
      {},
      (nextError) => {
        error = nextError;
        proceeded = !nextError;
      },
    );
    expect(error).toBeUndefined();
    expect(proceeded).toBe(true);
  });
});
