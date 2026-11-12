import { ApiError, apiRequest } from './http';
import { clearSession, getAccessToken, setSession } from './tokenStorage';

const MOCK_ENABLED = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true';

const MOCK_ACCOUNTS = [
  {
    email: 'admin@orvia.com',
    password: 'Password123!',
    user: {
      id: 'usr_mock_admin',
      fullName: 'System Admin',
      email: 'admin@orvia.com',
      role: 'ADMIN',
    },
  },
  {
    email: 'admin@agency.local',
    password: 'Password123!',
    user: {
      id: 'usr_mock_admin_legacy',
      fullName: 'System Admin',
      email: 'admin@agency.local',
      role: 'ADMIN',
    },
  },
  {
    email: 'am@orvia.com',
    password: 'Password123!',
    user: {
      id: 'usr_mock_am',
      fullName: 'Elena Vance',
      email: 'am@orvia.com',
      role: 'ACCOUNT_MANAGER',
    },
  },
  {
    email: 'employee@orvia.com',
    password: 'Password123!',
    user: {
      id: 'usr_mock_employee',
      fullName: 'Alex Rivera (Employee)',
      email: 'employee@orvia.com',
      role: 'CONTENT_CREATOR',
    },
  },
  {
    email: 'creator@orvia.com',
    password: 'Password123!',
    user: {
      id: 'usr_mock_employee',
      fullName: 'Alex Rivera (Employee)',
      email: 'employee@orvia.com',
      role: 'CONTENT_CREATOR',
    },
  },
  {
    email: 'elena.vance@orvia-creative.com',
    password: 'Password123!',
    user: {
      id: 'usr_mock_am_legacy',
      fullName: 'Elena Vance',
      email: 'elena.vance@orvia-creative.com',
      role: 'ACCOUNT_MANAGER',
    },
  },
  {
    email: 'client@orvia.com',
    password: 'Password123!',
    user: {
      id: 'usr_mock_client',
      fullName: 'Sarah Jenkins',
      email: 'client@orvia.com',
      role: 'CLIENT',
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
  return [
    { email: 'admin@orvia.com', password: 'Password123!', label: 'Admin (مدير النظام)' },
    { email: 'am@orvia.com', password: 'Password123!', label: 'Account Manager (مدير الحسابات)' },
    { email: 'employee@orvia.com', password: 'Password123!', label: 'Employee (صانع المحتوى / الموظف)' },
    { email: 'client@orvia.com', password: 'Password123!', label: 'Client (العميل)' },
  ];
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
        'Invalid credentials. Please use one of the accounts: admin@orvia.com, am@orvia.com, employee@orvia.com, client@orvia.com (Password: Password123!)',
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
  // The public demo build has no API behind it. Resolve mock accounts locally
  // instead of waiting for a network failure, because a static host answers
  // unknown POST routes with 405 rather than a 5xx. `MOCK_ENABLED` is a
  // compile-time false in production builds, so this branch is dropped there.
  if (MOCK_ENABLED) return mockLogin(email, password);

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

export async function resetPasswordApi({ token, newPassword }) {
  try {
    const body = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
      auth: false,
    });

    return {
      success: true,
      message: body?.message || 'Password updated. Sign in with your new password.',
    };
  } catch (error) {
    if (MOCK_ENABLED && isUnavailable(error)) {
      return {
        success: true,
        message: 'Mock mode: the password update was simulated. No account was changed.',
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
