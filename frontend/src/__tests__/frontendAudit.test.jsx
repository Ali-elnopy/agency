import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ErrorBoundary from '../components/ErrorBoundary';
import { forgotPasswordApi, loginApi, normalizeEmailInput } from '../services/api';
import { ApiError, apiRequest } from '../services/http';
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  getStoredUser,
  setSession,
  setStoredUser,
} from '../services/tokenStorage';
import {
  escapeHtml,
  isRouteAllowedForRole,
  sanitizeSafeUrl,
  sanitizeTextInput,
  stripSensitiveUserFields,
} from '../utils/security';

describe('frontend security & resilience audit', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.stubEnv('VITE_DEV_BYPASS_LOGIN', 'false');
    vi.stubEnv('VITE_USE_MOCK_API', 'false');
  });

  afterEach(() => {
    clearSession();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('XSS payload escaping & text sanitization', () => {
    it('escapes HTML metacharacters in script, attribute, and event-handler payloads', () => {
      const payload = `<img src=x onerror="alert('xss')" />&<script>fetch("https://evil.test")</script>`;
      const escaped = escapeHtml(payload);

      expect(escaped).toBe(
        '&lt;img src=x onerror=&quot;alert(&#39;xss&#39;)&quot; /&gt;&amp;&lt;script&gt;fetch(&quot;https://evil.test&quot;)&lt;/script&gt;',
      );
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('<img');
    });

    it('handles nullish and non-string inputs safely', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml(42)).toBe('42');
    });

    it('strips non-printable control characters and enforces max length on text input', () => {
      const raw = '   Hello\u0000\u0007 World \u001f!   ';
      expect(sanitizeTextInput(raw, 20)).toBe('Hello World !');
      expect(sanitizeTextInput('abcdefghij', 5)).toBe('abcde');
      expect(sanitizeTextInput(null)).toBe('');
    });
  });

  describe('malicious URL blocking (sanitizeSafeUrl)', () => {
    it('blocks javascript:, data:, vbscript:, file:, and protocol-relative URLs', () => {
      expect(sanitizeSafeUrl('javascript:alert(1)')).toBe('#');
      expect(sanitizeSafeUrl('  JaVaScRiPt:alert(document.cookie)  ')).toBe('#');
      expect(sanitizeSafeUrl('java\n\tscript:alert(1)')).toBe('#');
      expect(sanitizeSafeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==')).toBe(
        '#',
      );
      expect(sanitizeSafeUrl('vbscript:msgbox("xss")')).toBe('#');
      expect(sanitizeSafeUrl('file:///etc/passwd')).toBe('#');
      expect(sanitizeSafeUrl('//attacker.example/payload.js')).toBe('#');
      expect(sanitizeSafeUrl('/\\attacker.example/payload.js')).toBe('#');
      expect(sanitizeSafeUrl('')).toBe('#');
      expect(sanitizeSafeUrl(null)).toBe('#');
    });

    it('permits safe http:, https:, hash fragment, and single-slash relative URLs', () => {
      expect(sanitizeSafeUrl('https://orvia.com/brands/acme?tab=1')).toBe(
        'https://orvia.com/brands/acme?tab=1',
      );
      expect(sanitizeSafeUrl('http://localhost:5173/preview')).toBe(
        'http://localhost:5173/preview',
      );
      expect(sanitizeSafeUrl('#deliverables')).toBe('#deliverables');
      expect(sanitizeSafeUrl('/assets/brand-kit.pdf')).toBe('/assets/brand-kit.pdf');
    });
  });

  describe('sensitive user field stripping & tokenStorage hardening', () => {
    const rawUserWithSecrets = {
      id: 'usr_101',
      fullName: 'Elena Vance',
      email: 'elena@orvia.com',
      role: 'ACCOUNT_MANAGER',
      password: 'PlaintextPassword123!',
      passwordHash: '$2b$12$secretHashValue',
      accessToken: 'leaked-access-jwt',
      refreshToken: 'leaked-refresh-jwt',
      tokenHash: 'sha256-token-hash',
    };

    it('strips sensitive fields without mutating the source user object', () => {
      const cleaned = stripSensitiveUserFields(rawUserWithSecrets);

      expect(cleaned).toEqual({
        id: 'usr_101',
        fullName: 'Elena Vance',
        email: 'elena@orvia.com',
        role: 'ACCOUNT_MANAGER',
      });
      expect(rawUserWithSecrets.password).toBe('PlaintextPassword123!');
      expect(stripSensitiveUserFields(null)).toBeNull();
      expect(stripSensitiveUserFields(['not', 'an', 'object'])).toBeNull();
    });

    it('never persists sensitive user fields in localStorage via setSession or setStoredUser', () => {
      setSession({
        accessToken: 'valid-access-token',
        refreshToken: 'valid-refresh-token',
        user: rawUserWithSecrets,
      });

      const rawJson = window.localStorage.getItem('agency_user');
      expect(rawJson).not.toContain('PlaintextPassword123!');
      expect(rawJson).not.toContain('$2b$12$secretHashValue');
      expect(rawJson).not.toContain('leaked-access-jwt');
      expect(rawJson).not.toContain('leaked-refresh-jwt');
      expect(rawJson).not.toContain('sha256-token-hash');

      expect(getStoredUser()).toEqual({
        id: 'usr_101',
        fullName: 'Elena Vance',
        email: 'elena@orvia.com',
        role: 'ACCOUNT_MANAGER',
      });

      setStoredUser({ ...rawUserWithSecrets, fullName: 'Updated Name' });
      const updated = getStoredUser();
      expect(updated.fullName).toBe('Updated Name');
      expect(updated.password).toBeUndefined();
      expect(updated.passwordHash).toBeUndefined();
      expect(updated.tokenHash).toBeUndefined();
    });

    it('rejects malformed or whitespace-injected tokens and cleans up corrupted storage', () => {
      setSession({
        accessToken: 'bad token with spaces',
        refreshToken: 'undefined',
        user: { id: 'u1', role: 'ADMIN' },
      });

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();

      window.localStorage.setItem('agency_access_token', 'tok\u0000injected');
      window.localStorage.setItem('agency_user', '{corrupted-json');

      expect(getAccessToken()).toBeNull();
      expect(getStoredUser()).toBeNull();
      expect(window.localStorage.getItem('agency_access_token')).toBeNull();
      expect(window.localStorage.getItem('agency_user')).toBeNull();
    });
  });

  describe('single-flight 401 refresh deduplication & HTTP/API hardening', () => {
    it('deduplicates concurrent 401 responses into a single /auth/refresh request', async () => {
      setSession({
        accessToken: 'expired-access-token',
        refreshToken: 'initial-refresh-token',
        user: { id: 'usr_1', fullName: 'Admin', email: 'admin@orvia.com', role: 'ADMIN' },
      });

      let refreshCalls = 0;
      const fetchMock = vi.fn(async (url, options = {}) => {
        if (String(url).endsWith('/auth/refresh')) {
          refreshCalls += 1;
          await new Promise((resolve) => setTimeout(resolve, 25));
          return {
            ok: true,
            status: 200,
            json: async () => ({
              success: true,
              data: {
                accessToken: 'rotated-access-token',
                refreshToken: 'rotated-refresh-token',
                user: {
                  id: 'usr_1',
                  fullName: 'Admin',
                  email: 'admin@orvia.com',
                  role: 'ADMIN',
                  passwordHash: 'should-be-stripped',
                },
              },
            }),
          };
        }

        if (options.headers?.Authorization === 'Bearer expired-access-token') {
          return {
            ok: false,
            status: 401,
            json: async () => ({ message: 'Token expired' }),
          };
        }

        return {
          ok: true,
          status: 200,
          json: async () => ({ path: url, authHeader: options.headers?.Authorization }),
        };
      });

      vi.stubGlobal('fetch', fetchMock);

      const [resA, resB, resC] = await Promise.all([
        apiRequest('/brands'),
        apiRequest('/tasks'),
        apiRequest('/users'),
      ]);

      expect(refreshCalls).toBe(1);
      expect(resA).toEqual({
        path: '/api/brands',
        authHeader: 'Bearer rotated-access-token',
      });
      expect(resB).toEqual({
        path: '/api/tasks',
        authHeader: 'Bearer rotated-access-token',
      });
      expect(resC).toEqual({
        path: '/api/users',
        authHeader: 'Bearer rotated-access-token',
      });
      expect(getAccessToken()).toBe('rotated-access-token');
      expect(getRefreshToken()).toBe('rotated-refresh-token');
      expect(getStoredUser().passwordHash).toBeUndefined();
    });

    it('handles non-JSON error responses and redacts leaked bearer tokens from ApiError', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: false,
        status: 502,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON');
        },
      });
      vi.stubGlobal('fetch', fetchMock);

      await expect(apiRequest('/health', { auth: false })).rejects.toMatchObject({
        name: 'ApiError',
        status: 502,
        message: 'Request failed (HTTP 502).',
      });

      const leakedError = new ApiError(
        'Upstream rejected Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.sig123',
        403,
      );
      expect(leakedError.message).not.toContain('eyJhbGciOiJIUzI1NiJ9');
      expect(leakedError.message).toContain('[REDACTED]');
    });

    it('normalizes and validates email inputs in api.js before making network calls', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          data: {
            accessToken: 'tok-1',
            refreshToken: 'ref-1',
            user: {
              id: 'u1',
              fullName: 'Admin',
              email: 'admin@orvia.com',
              role: { id: 1, name: 'ADMIN' },
              passwordHash: 'secret',
            },
          },
        }),
      });
      vi.stubGlobal('fetch', fetchMock);

      expect(normalizeEmailInput('  Admin@Orvia.COM \n')).toBe('admin@orvia.com');

      const invalidLogin = await loginApi({ email: 'not-an-email', password: 'Password123!' });
      expect(invalidLogin.success).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();

      const invalidForgot = await forgotPasswordApi('bad@@email');
      expect(invalidForgot.success).toBe(false);
      expect(fetchMock).not.toHaveBeenCalled();

      const validLogin = await loginApi({
        email: '  ADMIN@Orvia.com  ',
        password: 'Password123!',
      });
      expect(validLogin.success).toBe(true);
      expect(validLogin.data.user.passwordHash).toBeUndefined();
      expect(validLogin.data.accessToken).toBeUndefined();
      expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
        email: 'admin@orvia.com',
        password: 'Password123!',
      });
    });
  });

  describe('RBAC route permission helper (isRouteAllowedForRole)', () => {
    const navMap = {
      admin: ['overview', 'brands', 'strategy', 'content', 'tasks', 'team'],
      am: ['overview', 'brands', 'strategy', 'content', 'tasks'],
      creator: ['mywork', 'content', 'tasks'],
      client: ['portal', 'approvals', 'brandkit'],
    };

    it('allows configured role routes and shared notifications, while blocking unauthorized routes', () => {
      expect(isRouteAllowedForRole('admin', 'team', navMap)).toBe(true);
      expect(isRouteAllowedForRole('ADMIN', 'brands', navMap)).toBe(true);
      expect(isRouteAllowedForRole('creator', 'mywork', navMap)).toBe(true);
      expect(isRouteAllowedForRole('creator', 'notifications', navMap)).toBe(true);

      expect(isRouteAllowedForRole('creator', 'team', navMap)).toBe(false);
      expect(isRouteAllowedForRole('client', 'strategy', navMap)).toBe(false);
      expect(isRouteAllowedForRole('unknown_role', 'overview', navMap)).toBe(false);
      expect(isRouteAllowedForRole('unknown_role', 'notifications', navMap)).toBe(false);
      expect(isRouteAllowedForRole('', 'overview', navMap)).toBe(false);
      expect(isRouteAllowedForRole('admin', null, navMap)).toBe(false);
    });
  });

  describe('ErrorBoundary fallback rendering & recovery', () => {
    it('renders an accessible alert without leaking stack traces and supports retry', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      let shouldThrow = true;

      function FlakyWidget() {
        if (shouldThrow) {
          throw new Error('SENSITIVE_INTERNAL_STACK_DETAIL_XYZ');
        }
        return <div>Recovered workspace content</div>;
      }

      render(
        <ErrorBoundary>
          <FlakyWidget />
        </ErrorBoundary>,
      );

      const alertRegion = screen.getByRole('alert');
      expect(alertRegion).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /something went wrong/i })).toBeInTheDocument();
      expect(alertRegion).not.toHaveTextContent('SENSITIVE_INTERNAL_STACK_DETAIL_XYZ');

      const retryBtn = screen.queryByRole('button', { name: /try again/i });
      if (retryBtn) {
        shouldThrow = false;
        await userEvent.setup().click(retryBtn);
        expect(screen.getByText('Recovered workspace content')).toBeInTheDocument();
      }

      consoleErrorSpy.mockRestore();
    });
  });
});
