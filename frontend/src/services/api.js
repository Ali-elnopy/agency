import { ApiError, apiRequest } from './http';
import { clearSession, getAccessToken, setSession } from './tokenStorage';

const MOCK_ENABLED = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true';

const MOCK_ACCOUNTS = [
  {
    email: import.meta.env.VITE_MOCK_EMAIL || 'elena.vance@orvia-creative.com',
    password: import.meta.env.VITE_MOCK_PASSWORD || '',
    user: {
      id: 'usr_mock_member',
      fullName: import.meta.env.VITE_MOCK_NAME || 'Elena Vance',
      email: import.meta.env.VITE_MOCK_EMAIL || 'elena.vance@orvia-creative.com',
      role: 'ACCOUNT_MANAGER',
    },
  },
  {
    email: import.meta.env.VITE_MOCK_ADMIN_EMAIL || 'admin@agency.local',
    password: import.meta.env.VITE_MOCK_ADMIN_PASSWORD || '',
    user: {
      id: 'usr_mock_admin',
      fullName: 'System Admin',
      email: import.meta.env.VITE_MOCK_ADMIN_EMAIL || 'admin@agency.local',
      role: 'ADMIN',
    },
  },
];

export function isMockApiEnabled() {
  return MOCK_ENABLED;
}

/**
 * Local development only. Written with `import.meta.env.DEV` inline so Vite
 * folds it to `false` and drops the bypass code from production bundles.
 */
export function isDevBypassEnabled() {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';
}

export function getMockCredentials() {
  if (!MOCK_ENABLED) return [];

  return MOCK_ACCOUNTS.filter((account) => account.password).map((account) => ({
    email: account.email,
    password: account.password,
    label: account.user.role === 'ADMIN' ? 'Admin' : 'Studio Lead',
  }));
}

function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500);
}

function mockLogin(email, password) {
  const account = MOCK_ACCOUNTS.find(
    (candidate) =>
      candidate.password &&
      candidate.email.toLowerCase() === String(email).trim().toLowerCase() &&
      candidate.password === password,
  );

  if (!account) {
    return {
      success: false,
      message:
        'Invalid demo credentials. Use one of the demo accounts configured in .env.local (VITE_MOCK_EMAIL / VITE_MOCK_PASSWORD).',
    };
  }

  setSession({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: account.user,
  });

  return { success: true, data: { user: account.user, isMock: true } };
}

export async function loginApi({ email, password }) {
  try {
    const body = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });

    if (body?.success && body.data?.user) {
      // The API returns `role` as a `{ id, name }` record; the shell components
      // (Sidebar / Topbar / Settings) compare the role name as a string.
      const sessionUser = {
        ...body.data.user,
        role: body.data.user.role?.name ?? body.data.user.role,
        roleId: body.data.user.role?.id ?? null,
      };

      setSession({
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
        user: sessionUser,
      });
      return { success: true, data: { ...body.data, user: sessionUser } };
    }

    return {
      success: false,
      message: body?.message || 'Invalid email or password',
    };
  } catch (error) {
    if (MOCK_ENABLED && isUnavailable(error)) {
      return mockLogin(email, password);
    }

    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : 'Cannot reach the authentication service. Check your connection and try again.',
    };
  }
}

export async function forgotPasswordApi(email) {
  try {
    const body = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email },
      auth: false,
    });

    return {
      success: true,
      message:
        body?.message ||
        'If the email exists, a verification link has been dispatched to your inbox.',
    };
  } catch (error) {
    if (MOCK_ENABLED && isUnavailable(error)) {
      return {
        success: true,
        message: 'Mock mode: the reset email was simulated. No message left this device.',
      };
    }

    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : 'Cannot reach the account service. Check your connection and try again.',
    };
  }
}

export function logout() {
  const token = getAccessToken();
  const isLocalSession =
    !token ||
    token === 'dev-bypass-token' ||
    token.startsWith('mock-') ||
    (import.meta.env.DEV &&
      import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
      token === 'dev-bypass-token');

  if (token && !isLocalSession) {
    // The API revokes the current session from the bearer token itself.
    apiRequest('/auth/logout', { method: 'POST', retry: false }).catch(() => {});
  }

  clearSession();
}
