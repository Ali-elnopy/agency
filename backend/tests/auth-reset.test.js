import crypto from 'node:crypto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

/**
 * These tests never touch PostgreSQL: the model layer and the mail transport
 * are replaced with in-memory fakes so the reset rules can be checked quickly.
 */
const state = {
  user: null,
  dbOffline: false,
  mailerConfigured: true,
  mailError: null,
  created: [],
  sent: [],
  latestOtp: null,
  attempts: [],
  markedUsed: [],
  issued: null,
  resetRecord: null,
  consumed: null,
  consumeResult: { applied: true },
};

vi.mock('../src/modules/auth/auth.model.js', () => ({
  AuthModel: {
    findUserByEmail: async () => {
      if (state.dbOffline) throw new Error('database offline');
      return state.user;
    },
    createPasswordResetToken: async (data) => {
      if (state.dbOffline) throw new Error('database offline');
      state.created.push(data);
      return { id: 'pr_1', ...data };
    },
    findLatestOtpForUser: async () => {
      if (state.dbOffline) throw new Error('database offline');
      return state.latestOtp;
    },
    incrementPasswordResetAttempts: async (id) => {
      state.attempts.push(id);
      return { id };
    },
    markPasswordResetTokenUsed: async (id) => {
      state.markedUsed.push(id);
      return { count: 1 };
    },
    issueResetToken: async (data) => {
      state.issued = data;
      return { id: data.tokenId, ...data };
    },
    findPasswordResetByResetTokenHash: async () => {
      if (state.dbOffline) throw new Error('database offline');
      return state.resetRecord;
    },
    consumePasswordResetToken: async (data) => {
      state.consumed = data;
      return state.consumeResult;
    },
  },
}));

vi.mock('../src/utils/mailer.js', () => ({
  isMailerConfigured: () => state.mailerConfigured,
  buildResetUrl: (token) => `https://app.example/#verify?token=${token}`,
  sendPasswordResetEmail: async (payload) => {
    if (state.mailError) throw state.mailError;
    state.sent.push(payload);
    return { provider: 'resend' };
  },
}));

const { AuthService } = await import('../src/modules/auth/auth.service.js');
const { default: app } = await import('../src/app.js');

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const minutesFromNow = (minutes) => new Date(Date.now() + minutes * 60 * 1000);
const passwordHash = (password) => bcrypt.hash(password, 4);

beforeEach(() => {
  state.user = null;
  state.dbOffline = false;
  state.mailerConfigured = true;
  state.mailError = null;
  state.created = [];
  state.sent = [];
  state.latestOtp = null;
  state.attempts = [];
  state.markedUsed = [];
  state.issued = null;
  state.resetRecord = null;
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
  it('stores only a hash of the 6-digit OTP and emails the raw one', async () => {
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
    expect(stored.expiresAt.getTime()).toBeLessThanOrEqual(minutesFromNow(10).getTime() + 1000);

    expect(state.sent).toHaveLength(1);
    expect(state.sent[0].to).toBe('mona@agency.local');
    expect(state.sent[0].token).toMatch(/^\d{6}$/);
    expect(sha256(state.sent[0].token)).toBe(stored.tokenHash);
    expect(stored.tokenHash).not.toBe(state.sent[0].token);
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

describe('POST /api/auth/verify-otp', () => {
  it('validates the email and the six-digit code', async () => {
    const badEmail = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'nope', otp: '123456' });
    const badOtp = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: 'mona@agency.local', otp: '12ab' });

    expect(badEmail.status).toBe(400);
    expect(badOtp.status).toBe(400);
  });

  it('rejects an incorrect code and counts the attempt', async () => {
    state.user = { id: 7, email: 'mona@agency.local', isActive: true };
    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: minutesFromNow(5),
      usedAt: null,
      attempts: 0,
    };

    await expect(
      AuthService.verifyOtp({ email: 'mona@agency.local', otp: '000000' }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(state.attempts).toEqual(['pr_1']);
  });

  it('locks the code after five incorrect attempts', async () => {
    state.user = { id: 7, email: 'mona@agency.local', isActive: true };
    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: minutesFromNow(5),
      usedAt: null,
      attempts: 4,
    };

    await expect(
      AuthService.verifyOtp({ email: 'mona@agency.local', otp: '000000' }),
    ).rejects.toMatchObject({ statusCode: 429 });

    expect(state.markedUsed).toContain('pr_1');
  });

  it('rejects expired and already-used codes', async () => {
    state.user = { id: 7, email: 'mona@agency.local', isActive: true };
    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: new Date(Date.now() - 1000),
      usedAt: null,
      attempts: 0,
    };

    await expect(
      AuthService.verifyOtp({ email: 'mona@agency.local', otp: '123456' }),
    ).rejects.toMatchObject({ statusCode: 400 });

    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: minutesFromNow(5),
      usedAt: new Date(),
      attempts: 0,
    };

    await expect(
      AuthService.verifyOtp({ email: 'mona@agency.local', otp: '123456' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('refuses to reuse an OTP after it has been verified', async () => {
    state.user = { id: 7, email: 'mona@agency.local', isActive: true };
    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: minutesFromNow(5),
      usedAt: null,
      verifiedAt: new Date(),
      attempts: 0,
    };

    await expect(
      AuthService.verifyOtp({ email: 'mona@agency.local', otp: '123456' }),
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(state.issued).toBeNull();
  });

  it('exchanges a correct code for a short-lived hashed reset token', async () => {
    state.user = { id: 7, email: 'mona@agency.local', isActive: true };
    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: minutesFromNow(5),
      usedAt: null,
      attempts: 1,
    };

    const result = await AuthService.verifyOtp({
      email: 'mona@agency.local',
      otp: '123456',
    });

    expect(result.resetToken).toMatch(/^[a-f0-9]{64}$/);
    expect(result.resetToken).not.toBe(sha256('123456'));
    expect(result.expiresInMinutes).toBe(10);

    expect(state.issued.tokenId).toBe('pr_1');
    expect(state.issued.resetTokenHash).toBe(sha256(result.resetToken));
    expect(state.issued.resetTokenExpiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(state.issued.resetTokenExpiresAt.getTime()).toBeLessThanOrEqual(
      minutesFromNow(10).getTime() + 1000,
    );
  });
});

describe('POST /api/auth/resend-otp', () => {
  it('enforces a cooldown between resends', async () => {
    state.user = { id: 7, email: 'mona@agency.local', isActive: true };
    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: minutesFromNow(9),
      usedAt: null,
      attempts: 0,
      createdAt: new Date(),
      lastSentAt: new Date(),
    };

    await expect(
      AuthService.resendOtp({ email: 'mona@agency.local' }),
    ).rejects.toMatchObject({ statusCode: 429 });

    expect(state.created).toHaveLength(0);
  });

  it('issues a fresh code once the cooldown has elapsed', async () => {
    state.user = { id: 7, email: 'mona@agency.local', isActive: true };
    state.latestOtp = {
      id: 'pr_1',
      userId: 7,
      tokenHash: sha256('123456'),
      expiresAt: minutesFromNow(9),
      usedAt: null,
      attempts: 0,
      createdAt: new Date(Date.now() - 120_000),
      lastSentAt: new Date(Date.now() - 120_000),
    };

    const result = await AuthService.resendOtp({ email: 'mona@agency.local' });

    expect(result.message).toMatch(/If an account exists/);
    expect(state.created).toHaveLength(1);
    expect(state.sent).toHaveLength(1);
    expect(state.sent[0].token).toMatch(/^\d{6}$/);
    expect(sha256(state.sent[0].token)).toBe(state.created[0].tokenHash);
  });

  it('answers generically for unknown accounts without sending', async () => {
    const result = await AuthService.resendOtp({ email: 'ghost@agency.local' });

    expect(result.message).toMatch(/If an account exists/);
    expect(state.created).toHaveLength(0);
    expect(state.sent).toHaveLength(0);
  });
});

describe('AuthService.resetPassword', () => {
  const resetRecordFor = async (token, overrides = {}) => ({
    id: 'pr_1',
    userId: 7,
    resetTokenHash: sha256(token),
    resetTokenExpiresAt: minutesFromNow(10),
    usedAt: null,
    user: {
      id: 7,
      email: 'mona@agency.local',
      passwordHash: await passwordHash('OldPassword!23'),
      isActive: true,
    },
    ...overrides,
  });

  it('rejects an expired reset authorization', async () => {
    const token = 'a'.repeat(64);
    state.resetRecord = await resetRecordFor(token, {
      resetTokenExpiresAt: new Date(Date.now() - 1000),
    });

    await expect(
      AuthService.resetPassword({ resetToken: token, newPassword: 'BrandNew!2345' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects an already-used reset authorization', async () => {
    const token = 'b'.repeat(64);
    state.resetRecord = await resetRecordFor(token, { usedAt: new Date() });

    await expect(
      AuthService.resetPassword({ resetToken: token, newPassword: 'BrandNew!2345' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects an unknown reset token', async () => {
    state.resetRecord = null;

    await expect(
      AuthService.resetPassword({ resetToken: 'c'.repeat(64), newPassword: 'BrandNew!2345' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('refuses to reuse the current password', async () => {
    const token = 'd'.repeat(64);
    state.resetRecord = await resetRecordFor(token);

    await expect(
      AuthService.resetPassword({ resetToken: token, newPassword: 'OldPassword!23' }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(state.consumed).toBeNull();
  });

  it('hashes the new password, consumes the token and revokes sessions', async () => {
    const token = 'e'.repeat(64);
    state.resetRecord = await resetRecordFor(token);

    const result = await AuthService.resetPassword(
      { resetToken: token, newPassword: 'BrandNew!2345' },
      { ipAddress: '203.0.113.9', userAgent: 'vitest' },
    );

    expect(result.message).toMatch(/Password updated/);
    expect(state.consumed).toMatchObject({ tokenId: 'pr_1', userId: 7 });
    expect(state.consumed.ipAddress).toBe('203.0.113.9');
    expect(await bcrypt.compare('BrandNew!2345', state.consumed.passwordHash)).toBe(true);
  });

  it('accepts the legacy token field during rollout', async () => {
    const token = 'f'.repeat(64);
    state.resetRecord = await resetRecordFor(token);

    const result = await AuthService.resetPassword({
      token,
      newPassword: 'BrandNew!2345',
    });

    expect(result.message).toMatch(/Password updated/);
    expect(state.consumed).toMatchObject({ tokenId: 'pr_1', userId: 7 });
  });

  it('fails closed when the token is claimed concurrently', async () => {
    const token = 'a1'.repeat(32);
    state.resetRecord = await resetRecordFor(token);
    state.consumeResult = { applied: false };

    await expect(
      AuthService.resetPassword({ resetToken: token, newPassword: 'BrandNew!2345' }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

describe('database-offline fallback', () => {
  it('keeps the OTP → reset token flow usable without PostgreSQL', async () => {
    state.dbOffline = true;

    const email = 'offline-flow@agency.local';
    const forgot = await AuthService.requestPasswordReset({ email });

    expect(forgot.code).toMatch(/^\d{6}$/);

    const verified = await AuthService.verifyOtp({ email, otp: forgot.code });

    expect(verified.resetToken).toMatch(/^[a-f0-9]{64}$/);

    const reset = await AuthService.resetPassword({
      resetToken: verified.resetToken,
      newPassword: 'OfflineNew!2345',
    });

    expect(reset.message).toMatch(/Password updated/);
    expect(reset.email).toBe(email);
  });
});

describe('validation', () => {
  it('rejects reset authorizations that are not 64 hex characters', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ resetToken: 'too-short', newPassword: 'BrandNew!2345' });

    expect(res.status).toBe(400);
  });

  it('rejects weak replacement passwords', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ resetToken: 'f'.repeat(64), newPassword: 'weak' });

    expect(res.status).toBe(400);
  });

  it('requires a reset token on the reset endpoint', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ newPassword: 'BrandNew!2345' });

    expect(res.status).toBe(400);
  });
});
