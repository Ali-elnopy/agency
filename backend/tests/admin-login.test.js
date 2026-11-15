import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

const mockAdminUser = {
  id: 1,
  fullName: 'System Admin',
  email: 'admin@agency.local',
  passwordHash: '',
  phone: '+1 555 0100',
  isActive: true,
  lastLoginAt: null,
  createdAt: new Date(),
  role: { id: 5, name: 'ADMIN' },
  jobTitle: null,
  failedLoginAttempts: 0,
  failedLoginWindowStart: null,
  loginLockedUntil: null,
};

let currentUser = null;

vi.mock('../src/modules/auth/auth.model.js', () => ({
  AuthModel: {
    findUserByEmail: async (email) => {
      if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
        return currentUser;
      }
      return null;
    },
    findUserById: async (id) => {
      if (currentUser && currentUser.id === id) {
        return currentUser;
      }
      return null;
    },
    createSession: async (data) => ({
      id: 'sess_admin_test_1',
      ...data,
    }),
    resetLoginFailures: async () => {},
    updateLastLogin: async () => {},
    recordFailedLoginAttempt: async () => ({ locked: false, attempts: 1 }),
  },
}));

vi.mock('../src/utils/tokens.js', () => ({
  generateAccessToken: () => 'mock-admin-access-token',
}));

vi.mock('../src/utils/refreshTokens.js', () => ({
  generateRefreshToken: () => 'mock-admin-refresh-token',
  hashRefreshToken: () => 'mock-admin-refresh-token-hash',
}));

const { default: app } = await import('../src/app.js');

describe('Admin login flow (admin@agency.local / ChangeMe123!)', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('ChangeMe123!', 10);
    currentUser = {
      ...mockAdminUser,
      passwordHash,
    };
  });

  it('successfully logs in with admin@agency.local and ChangeMe123!', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@agency.local', password: 'ChangeMe123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.data.user.email).toBe('admin@agency.local');
    expect(res.body.data.user.role.name).toBe('ADMIN');
    expect(res.body.data.accessToken).toBe('mock-admin-access-token');
    expect(res.body.data.refreshToken).toBe('mock-admin-refresh-token');
  });

  it('normalizes email case and logs in successfully', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@AGENCY.LOCAL', password: 'ChangeMe123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@agency.local');
  });

  it('returns 401 when given an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@agency.local', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Invalid email or password');
  });
});
