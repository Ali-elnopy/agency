import crypto from 'node:crypto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

/**
 * These tests never touch PostgreSQL: the model layer and the mail transport
 * are replaced with in-memory fakes so the auth rules can be checked quickly.
 */
const state = {
  user: null,
  mailerConfigured: true,
  mailError: null,
  created: [],
  sent: [],
  tokenRecord: null,
  consumed: null,
  consumeResult: { applied: true },
};

vi.mock('../src/modules/auth/auth.model.js', () => ({
  AuthModel: {
    findUserByEmail: async () => state.user,
    createPasswordResetToken: async (data) => {
      state.created.push(data);
      return { id: 'tok_1', ...data };
    },
    findPasswordResetToken: async () => state.tokenRecord,
    consumePasswordResetToken: async (data) => {
      state.consumed = data;
      return state.consumeResult;
    },
  },
}));

vi.mock('../src/utils/mailer.js', () => ({
  isMailerConfigured: () => state.mailerConfigured,
  buildResetUrl: (token) => `https://app.example/#reset?token=${token}`,
  sendPasswordResetEmail: async (payload) => {
    if (state.mailError) throw state.mailError;
    state.sent.push(payload);
    return { resetUrl: `https://app.example/#reset?token=${payload.token}` };
  },
}));

const { AuthService } = await import('../src/modules/auth/auth.service.js');
const { default: app } = await import('../src/app.js');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

beforeEach(() => {
  state.user = null;
  state.mailerConfigured = true;
  state.mailError = null;
  state.created = [];
  state.sent = [];
  state.tokenRecord = null;
  state.consumed = null;
  state.consumeResult = { applied: true };
});

describe('POST /api/auth/forgot-password', () => {
  it('rejects an invalid email before doing any work', async () => {
    const res = await request(app).post('/api/auth/forgot-password').send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
    expect(state.created).toHaveLength(0);
  });

  it('answers 503 when no mail transport is configured', async () => {
    state.mailerConfigured = false;

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'someone@agency.local' });

    expect(res.status).toBe(503);
    expect(state.created).toHaveLength(0);
  });

  it('does not reveal whether an account exists', async () => {
    state.user = null;

    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'ghost@agency.local' });

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/If an account exists/);
    expect(state.created).toHaveLength(0);
    expect(state.sent).toHaveLength(0);
  });
});

describe('AuthService.requestPasswordReset', () => {
  it('stores only a hash of the token and emails the raw one', async () => {
    state.user = {
      id: 7,
      fullName: 'Mona Ali',
      email: 'mona@agency.local',
      isActive: true,
    };

    const result = await AuthService.requestPasswordReset({ email: 'Mona@Agency.local ' });

    expect(result.message).toMatch(/If an account exists/);
    expect(state.created).toHaveLength(1);

    const stored = state.created[0];
    expect(stored.userId).toBe(7);
    expect(stored.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());

    expect(state.sent).toHaveLength(1);
    expect(state.sent[0].to).toBe('mona@agency.local');
    expect(sha256(state.sent[0].token)).toBe(stored.tokenHash);
  });

  it('still answers generically when delivery fails', async () => {
    state.user = { id: 8, fullName: 'Sam', email: 'sam@agency.local', isActive: true };
    state.mailError = new Error('provider down');
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await AuthService.requestPasswordReset({ email: 'sam@agency.local' });

    expect(result.message).toMatch(/If an account exists/);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('ignores inactive accounts', async () => {
    state.user = { id: 9, fullName: 'Old', email: 'old@agency.local', isActive: false };

    await AuthService.requestPasswordReset({ email: 'old@agency.local' });

    expect(state.created).toHaveLength(0);
    expect(state.sent).toHaveLength(0);
  });
});

describe('AuthService.resetPassword', () => {
  const hash = (password) => bcrypt.hash(password, 4);

  it('rejects an expired link', async () => {
    state.tokenRecord = {
      id: 'tok_1',
      usedAt: null,
      expiresAt: new Date(Date.now() - 1000),
      user: { id: 7, passwordHash: await hash('OldPassword!23'), isActive: true },
    };

    await expect(
      AuthService.resetPassword({ token: 'a'.repeat(64), newPassword: 'BrandNew!2345' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects a link that was already used', async () => {
    state.tokenRecord = {
      id: 'tok_1',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 7, passwordHash: await hash('OldPassword!23'), isActive: true },
    };

    await expect(
      AuthService.resetPassword({ token: 'b'.repeat(64), newPassword: 'BrandNew!2345' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('refuses to reuse the current password', async () => {
    state.tokenRecord = {
      id: 'tok_1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 7, passwordHash: await hash('SamePassword!23'), isActive: true },
    };

    await expect(
      AuthService.resetPassword({ token: 'c'.repeat(64), newPassword: 'SamePassword!23' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(state.consumed).toBeNull();
  });

  it('hashes the new password and consumes the token', async () => {
    state.tokenRecord = {
      id: 'tok_1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 7, passwordHash: await hash('OldPassword!23'), isActive: true },
    };

    const result = await AuthService.resetPassword(
      { token: 'd'.repeat(64), newPassword: 'BrandNew!2345' },
      { ipAddress: '203.0.113.9', userAgent: 'vitest' },
    );

    expect(result.message).toMatch(/Password updated/);
    expect(state.consumed).toMatchObject({ tokenId: 'tok_1', userId: 7 });
    expect(state.consumed.ipAddress).toBe('203.0.113.9');
    expect(await bcrypt.compare('BrandNew!2345', state.consumed.passwordHash)).toBe(true);
  });

  it('fails closed when the token is claimed concurrently', async () => {
    state.tokenRecord = {
      id: 'tok_1',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 7, passwordHash: await hash('OldPassword!23'), isActive: true },
    };
    state.consumeResult = { applied: false };

    await expect(
      AuthService.resetPassword({ token: 'e'.repeat(64), newPassword: 'BrandNew!2345' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('validation', () => {
  it('rejects reset tokens that are not 64 hex characters', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'too-short', newPassword: 'BrandNew!2345' });

    expect(res.status).toBe(400);
  });

  it('rejects weak replacement passwords', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'f'.repeat(64), newPassword: 'weak' });

    expect(res.status).toBe(400);
  });
});
