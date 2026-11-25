import { ApiError, apiRequest } from './http';
import { clearSession, getAccessToken, setSession } from './tokenStorage';
import { sanitizeTextInput, stripSensitiveUserFields } from '../utils/security';
import { isValidEmail } from '../utils/validation';

const MAX_EMAIL_LENGTH = 254;
const MAX_OTP_LENGTH = 12;
const MAX_RESET_TOKEN_LENGTH = 2048;

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

/**
 * Trims, removes control characters, enforces RFC 5321 max length, and lowercases
 * an email input prior to validation or API transmission.
 *
 * @param {unknown} email
 * @returns {string}
 */
export function normalizeEmailInput(email) {
  return sanitizeTextInput(email, MAX_EMAIL_LENGTH).toLowerCase();
}

export function isMockApiEnabled() {
  return import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true';
}

/**
 * Local development only. Written with `import.meta.env.DEV` inline so Vite
 * folds it to `false` and drops the bypass code from production bundles.
 */
export function isDevBypassEnabled() {
  return import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true';
}

function isUnavailable(error) {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500);
}

function normalizeSessionUser(rawUser) {
  const cleaned = stripSensitiveUserFields(rawUser);
  if (!cleaned) return null;

  return {
    ...cleaned,
    role: cleaned.role?.name ?? cleaned.role,
    roleId: cleaned.role?.id ?? cleaned.roleId ?? null,
  };
}

function mockLogin(normalizedEmail, password) {
  const account = MOCK_ACCOUNTS.find(
    (candidate) =>
      candidate.password &&
      candidate.email.toLowerCase() === normalizedEmail &&
      candidate.password === password,
  );

  if (!account) {
    return {
      success: false,
      message:
        'Invalid credentials. Please use one of the accounts: admin@orvia.com, am@orvia.com, employee@orvia.com, client@orvia.com (Password: Password123!)',
    };
  }

  const safeUser = stripSensitiveUserFields(account.user);

  setSession({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: safeUser,
  });

  return { success: true, data: { user: safeUser, isMock: true } };
}

export async function loginApi({ email, password } = {}) {
  const normalizedEmail = normalizeEmailInput(email);
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return {
      success: false,
      message: 'Enter a valid email address.',
    };
  }

  if (typeof password !== 'string' || password.length === 0) {
    return {
      success: false,
      message: 'Invalid email or password',
    };
  }

  // The public demo build has no API behind it. Resolve mock accounts locally
  // instead of waiting for a network failure, because a static host answers
  // unknown POST routes with 405 rather than a 5xx. `MOCK_ENABLED` is a
  // compile-time false in production builds, so this branch is dropped there.
  if (import.meta.env.DEV && isMockApiEnabled()) return mockLogin(normalizedEmail, password);

  try {
    const body = await apiRequest('/auth/login', {
      method: 'POST',
      body: { email: normalizedEmail, password },
      auth: false,
    });

    if (body?.success && body.data?.user) {
      // The API returns `role` as a `{ id, name }` record; the shell components
      // (Sidebar / Topbar / Settings) compare the role name as a string.
      const sessionUser = normalizeSessionUser(body.data.user);

      setSession({
        accessToken: body.data.accessToken,
        refreshToken: body.data.refreshToken,
        user: sessionUser,
      });

      const safeData = { ...body.data, user: sessionUser };
      delete safeData.accessToken;
      delete safeData.refreshToken;

      return { success: true, data: safeData };
    }

    return {
      success: false,
      message: body?.message || 'Invalid email or password',
    };
  } catch (error) {
    if (import.meta.env.DEV && isMockApiEnabled() && isUnavailable(error)) {
      return mockLogin(normalizedEmail, password);
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
  const normalizedEmail = normalizeEmailInput(email);
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return {
      success: false,
      message: 'Enter a valid email address.',
    };
  }

  try {
    const body = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: { email: normalizedEmail },
      auth: false,
    });

    return {
      success: true,
      message:
        body?.message ||
        'If the email exists, a verification code has been dispatched to your inbox.',
      data: body?.data || {},
    };
  } catch (error) {
    if (import.meta.env.DEV && isMockApiEnabled() && isUnavailable(error)) {
      return {
        success: true,
        message: 'Mock mode: the reset email was simulated. No message left this device.',
        data: {},
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

export async function resendOtpApi(email) {
  const normalizedEmail = normalizeEmailInput(email);
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return {
      success: false,
      message: 'Enter a valid email address.',
    };
  }

  try {
    const body = await apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: { email: normalizedEmail },
      auth: false,
    });

    return {
      success: true,
      message: body?.message || 'A new verification code is on its way.',
      data: body?.data || {},
    };
  } catch (error) {
    if (import.meta.env.DEV && isMockApiEnabled() && isUnavailable(error)) {
      return {
        success: true,
        message: 'Mock mode: the resend was simulated. No message left this device.',
        data: {},
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

export async function verifyOtpApi({ email, otp } = {}) {
  const normalizedEmail = normalizeEmailInput(email);
  if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
    return {
      success: false,
      message: 'Enter a valid email address.',
    };
  }

  const normalizedOtp = sanitizeTextInput(otp, MAX_OTP_LENGTH);
  if (!normalizedOtp) {
    return {
      success: false,
      message: 'Enter the verification code.',
    };
  }

  try {
    const body = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: { email: normalizedEmail, otp: normalizedOtp },
      auth: false,
    });

    return {
      success: true,
      message: body?.message || 'Verification successful. Choose a new password.',
      data: body?.data || {},
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : 'Cannot reach the account service. Check your connection and try again.',
    };
  }
}

export async function resetPasswordApi({ resetToken, token, newPassword } = {}) {
  const resolvedToken = sanitizeTextInput(resetToken || token, MAX_RESET_TOKEN_LENGTH);
  if (!resolvedToken) {
    return {
      success: false,
      message: 'Reset token is missing or invalid.',
    };
  }

  if (typeof newPassword !== 'string' || newPassword.length === 0) {
    return {
      success: false,
      message: 'Enter a valid new password.',
    };
  }

  try {
    const body = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: { resetToken: resolvedToken, newPassword },
      auth: false,
    });

    return {
      success: true,
      message: body?.message || 'Password updated. Sign in with your new password.',
      data: body?.data || {},
    };
  } catch (error) {
    if (import.meta.env.DEV && isMockApiEnabled() && isUnavailable(error)) {
      return {
        success: true,
        message: 'Mock mode: the password update was simulated. No account was changed.',
        data: {},
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

export async function fetchCurrentUserApi() {
  if (import.meta.env.DEV && isMockApiEnabled()) return null;

  const body = await apiRequest('/auth/me');
  const user = body?.data?.user;

  if (!user) return null;

  // Keep the same normalised shape that login stores: `role` is the role name
  // string and `roleId` the numeric id, because the shell compares strings.
  return normalizeSessionUser(user);
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
