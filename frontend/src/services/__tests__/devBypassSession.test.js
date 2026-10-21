import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { logout } from '../api';
import { apiRequest, SESSION_EXPIRED_EVENT } from '../http';
import { getUsers } from '../users';
import { getAccessToken, getRefreshToken, setSession } from '../tokenStorage';

const DEV_USER = {
  id: 'usr_dev_bypass',
  fullName: 'Dev Admin',
  email: 'dev@orvia.local',
  role: 'ADMIN',
};

describe('development bypass session', () => {
  let fetchMock;

  beforeEach(() => {
    vi.stubEnv('VITE_DEV_BYPASS_LOGIN', 'true');
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    setSession({
      accessToken: 'dev-bypass-token',
      refreshToken: 'dev-bypass-refresh-token',
      user: DEV_USER,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('serves fixtures without touching the network or expiring the session', async () => {
    const expired = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, expired);

    const { users, stats } = await getUsers();

    window.removeEventListener(SESSION_EXPIRED_EVENT, expired);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(users.length).toBeGreaterThan(0);
    expect(stats).toBeTruthy();
    expect(expired).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('dev-bypass-token');
    expect(JSON.parse(window.localStorage.getItem('agency_user'))).toEqual(
      expect.objectContaining({ role: 'ADMIN' }),
    );
  });

  it('turns a dev-session request into a status-0 ApiError instead of refreshing', async () => {
    await expect(apiRequest('/users')).rejects.toMatchObject({ status: 0 });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(getAccessToken()).toBe('dev-bypass-token');
  });

  it('clears a dev session without revoking the fake token over the network', () => {
    logout();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(getAccessToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it('leaves real sessions sending requests normally', async () => {
    vi.stubEnv('VITE_DEV_BYPASS_LOGIN', 'false');
    setSession({
      accessToken: 'real-token',
      refreshToken: 'real-refresh-token',
      user: { ...DEV_USER, id: 'usr_real' },
    });
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ users: [], stats: {} }),
    });

    await expect(apiRequest('/users')).resolves.toEqual({ users: [], stats: {} });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe('real-token');
  });
});
