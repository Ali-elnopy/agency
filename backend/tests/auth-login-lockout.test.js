import crypto from 'node:crypto';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

const state = {
  user: null,
  sessions: [],
  updatedUsers: [],
};

vi.mock('../src/modules/auth/auth.model.js', () => ({
  AuthModel: {
    findUserByEmail: async (email) => {
      if (state.user && state.user.email === email) {
        return state.user;
      }
      return null;
    },
    findUserById: async (id) => {
      if (state.user && state.user.id === id) {
        return state.user;
      }
      return null;
    },
    createSession: async (data) => {
      const session = { id: `sess_${state.sessions.length + 1}`, ...data };
      state.sessions.push(session);
      return session;
    },
    recordFailedLogin: vi.fn(),
    resetLoginFailures: async (userId) => {
      if (state.user && state.user.id === userId) {
        state.user.failedLoginAttempts = 0;
        state.user.failedLoginWindowStart = null;
        state.user.loginLockedUntil = null;
      }
      state.updatedUsers.push({ type: 'resetLoginFailures', userId });
      return state.user;
    },
    updateLastLogin: async (userId) => {
      state.updatedUsers.push({ type: 'updateLastLogin', userId });
      return state.user;
    },
    recordFailedLoginAttempt: async (
      userId,
      { maxAttempts, windowMs, lockDurationMs, now = Date.now() },
    ) => {
      if (!state.user || state.user.id !== userId) {
        throw new Error('User not found');
      }

      const currentNow = typeof now === 'number' ? now : Date.now();
      const lockUntil = state.user.loginLockedUntil
        ? state.user.loginLockedUntil.getTime()
        : null;

      if (lockUntil && lockUntil > currentNow) {
        return { locked: true, attempts: state.user.failedLoginAttempts };
      }

      const windowStart = state.user.failedLoginWindowStart
        ? state.user.failedLoginWindowStart.getTime()
        : null;

      const windowExpired = !windowStart || currentNow - windowStart >= windowMs;

      const attempts = windowExpired ? 1 : state.user.failedLoginAttempts + 1;
      const nextWindowStart = windowExpired
        ? new Date(currentNow)
        : state.user.failedLoginWindowStart;

      const shouldLock = attempts >= maxAttempts;
      const nextLockUntil = shouldLock ? new Date(currentNow + lockDurationMs) : null;

      state.user.failedLoginAttempts = attempts;
      state.user.failedLoginWindowStart = nextWindowStart;
      state.user.loginLockedUntil = nextLockUntil;

      state.updatedUsers.push({
        type: 'recordFailedLoginAttempt',
        userId,
        attempts,
        locked: shouldLock,
      });

      return { locked: shouldLock, attempts };
    },
  },
}));

vi.mock('../../utils/tokens.js', () => ({
  generateAccessToken: () => 'test-access-token',
}));

vi.mock('../../utils/refreshTokens.js', () => ({
  generateRefreshToken: () => 'test-refresh-token',
  hashRefreshToken: (token) => crypto.createHash('sha256').update(token).digest('hex'),
}));

const { default: app } = await import('../src/app.js');

const createUser = async (overrides = {}) => {
  const passwordHash = await bcrypt.hash(overrides.password || 'Password123!', 4);
  return {
    id: 1,
    fullName: 'Test User',
    email: 'user@agency.local',
    passwordHash,
    phone: null,
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    role: { id: 1, name: 'ADMIN' },
    jobTitle: null,
    failedLoginAttempts: 0,
    failedLoginWindowStart: null,
    loginLockedUntil: null,
    ...overrides,
  };
};

describe('Auth login account lockout (TC-RV2-22-05)', () => {
  beforeEach(() => {
    state.user = null;
    state.sessions = [];
    state.updatedUsers = [];
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not lock on first four failed attempts and counts within 10 minute window', async () => {
    state.user = await createUser();

    for (let i = 1; i <= 4; i += 1) {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@agency.local', password: 'wrong-pass' });

      expect(res.status).toBe(401);
      expect(res.body?.message).toBe('Invalid email or password');
      expect(state.user.failedLoginAttempts).toBe(i);
      expect(state.user.loginLockedUntil).toBeNull();
    }
  });

  it('locks the account on the fifth failed attempt within 10 minutes and returns 423', async () => {
    state.user = await createUser();

    for (let i = 1; i <= 4; i += 1) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'user@agency.local', password: 'wrong-pass' });
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@agency.local', password: 'wrong-pass' });

    expect(res.status).toBe(423);
    expect(res.body?.message).toBe('Too many failed attempts. Please try again later.');
    expect(state.user.failedLoginAttempts).toBe(5);
    expect(state.user.loginLockedUntil).toBeInstanceOf(Date);
    expect(state.user.loginLockedUntil.getTime()).toBeGreaterThan(Date.now());
  });

  it('rejects correct credentials while locked and does not bypass lockout', async () => {
    state.user = await createUser();
    const now = Date.now();
    state.user.failedLoginAttempts = 5;
    state.user.failedLoginWindowStart = new Date(now - 60_000);
    state.user.loginLockedUntil = new Date(now + 15 * 60 * 1000);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@agency.local', password: 'Password123!' });

    expect(res.status).toBe(423);
    expect(res.body?.message).toBe('Too many failed attempts. Please try again later.');
    expect(state.sessions).toHaveLength(0);
  });

  it('rejects incorrect password while locked without bypassing lockout', async () => {
    state.user = await createUser();
    const now = Date.now();
    state.user.failedLoginAttempts = 5;
    state.user.failedLoginWindowStart = new Date(now - 60_000);
    state.user.loginLockedUntil = new Date(now + 15 * 60 * 1000);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@agency.local', password: 'totally-wrong' });

    expect(res.status).toBe(423);
    expect(res.body?.message).toBe('Too many failed attempts. Please try again later.');
  });

  it('starts a new counting window after 10 minutes have expired', async () => {
    vi.useFakeTimers();
    const base = new Date('2026-01-01T00:00:00Z');
    vi.setSystemTime(base);
    state.user = await createUser();
    state.user.failedLoginAttempts = 5;
    state.user.failedLoginWindowStart = new Date(base.getTime() - 20 * 60 * 1000);
    state.user.loginLockedUntil = null;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@agency.local', password: 'wrong-pass' });

    expect(res.status).toBe(401);
    expect(state.user.failedLoginAttempts).toBe(1);
    expect(state.user.failedLoginWindowStart?.toISOString()).toBe(base.toISOString());
    expect(state.user.loginLockedUntil).toBeNull();
  });

  it('resets failed attempts on successful login', async () => {
    state.user = await createUser();
    state.user.failedLoginAttempts = 3;
    state.user.failedLoginWindowStart = new Date(Date.now() - 60_000);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@agency.local', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(state.user.failedLoginAttempts).toBe(0);
    expect(state.user.failedLoginWindowStart).toBeNull();
    expect(state.user.loginLockedUntil).toBeNull();
  });

  it('allows login after lockout expires with valid credentials', async () => {
    vi.useFakeTimers();
    const base = new Date('2026-01-01T00:00:00Z');
    vi.setSystemTime(base);
    state.user = await createUser();
    state.user.failedLoginAttempts = 5;
    state.user.failedLoginWindowStart = new Date(base.getTime() - 12 * 60 * 1000);
    state.user.loginLockedUntil = new Date(base.getTime() - 1000);

    vi.setSystemTime(new Date(base.getTime() + 2000));

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@agency.local', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body?.success).toBe(true);
    expect(state.user.failedLoginAttempts).toBe(0);
    expect(state.user.loginLockedUntil).toBeNull();
  });

  it('does not distinguish unknown emails from invalid passwords (no account enumeration)', async () => {
    state.user = null;

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'does-not-exist@agency.local', password: 'wrong' });

    expect(res.status).toBe(401);
    expect(res.body?.message).toBe('Invalid email or password');
  });
});
