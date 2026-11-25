import { getAccessToken, getRefreshToken, setSession } from './tokenStorage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// The Express API exposes `POST /api/auth/refresh` and rotates the refresh
// token on every call, so a 401 can be recovered without a re-login.
const REFRESH_ENDPOINT_AVAILABLE = true;

export const SESSION_EXPIRED_EVENT = 'orvia:session-expired';

const BEARER_LEAK_PATTERN = /Bearer\s+[A-Za-z0-9._~+/=-]+/gi;
const JWT_LEAK_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;

/**
 * Redacts accidental Authorization headers or raw JWT strings from error text
 * so sensitive credentials never leak into UI alerts or error reporters.
 *
 * @param {unknown} message
 * @param {string} fallback
 * @returns {string}
 */
function sanitizeErrorMessage(message, fallback) {
  if (typeof message !== 'string') return fallback;

  const trimmed = message.trim();
  if (!trimmed) return fallback;

  return trimmed
    .replace(BEARER_LEAK_PATTERN, 'Bearer [REDACTED]')
    .replace(JWT_LEAK_PATTERN, '[REDACTED_TOKEN]');
}

export class ApiError extends Error {
  constructor(message, status = 0, fieldErrors = undefined) {
    super(sanitizeErrorMessage(message, 'Request failed.'));
    this.name = 'ApiError';
    this.status = status;
    // Field-level validation errors returned by the API (zod issues shape:
    // [{ field, message }]) so forms can show the message on the right input.
    this.fieldErrors = fieldErrors;
  }
}

async function readJson(response) {
  if (!response || response.status === 204 || response.status === 205) return null;
  if (typeof response.json !== 'function') return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

let refreshRequest = null;

/**
 * Refreshes once and shares the in-flight promise so parallel 401s do not
 * trigger duplicate `/auth/refresh` stampedes or invalidate a rotated token.
 *
 * @returns {Promise<boolean>}
 */
async function refreshSession() {
  if (!REFRESH_ENDPOINT_AVAILABLE) return false;

  // Always join an active refresh first before reading storage again.
  if (refreshRequest) return refreshRequest;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  refreshRequest = (async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response || !response.ok) return false;

      const body = await readJson(response);
      const nextAccessToken = body?.data?.accessToken;
      if (typeof nextAccessToken !== 'string' || !nextAccessToken.trim()) {
        return false;
      }

      setSession({
        accessToken: nextAccessToken,
        refreshToken: body.data.refreshToken,
        user: body.data.user,
      });
      return true;
    } catch {
      return false;
    } finally {
      refreshRequest = null;
    }
  })();

  return refreshRequest;
}

/**
 * Every backend call goes through here: JSON in/out, bearer token, one retry
 * after a single-flight refresh, and one sanitized error shape for the UI.
 */
export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = {};
  const token = auth ? getAccessToken() : null;

  // Never send the development token to a real backend: services treat this
  // status-0 error as "use local fixtures".
  if (
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
    token === 'dev-bypass-token'
  ) {
    throw new ApiError('Development session: no backend request was sent.', 0);
  }

  let serializedBody;
  if (body !== undefined) {
    try {
      serializedBody = JSON.stringify(body);
    } catch {
      throw new ApiError('Invalid request payload.', 0);
    }
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: serializedBody,
    });
  } catch {
    // Be honest about what happened: "offline" only when the browser really
    // is offline, otherwise the server itself is unreachable.
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    throw new ApiError(
      isOffline
        ? 'You appear to be offline. Check your connection and try again.'
        : 'Could not reach the server. It may be down or restarting — please try again.',
      0,
    );
  }

  if (response.status === 401 && auth && retry) {
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
      token === 'dev-bypass-token'
    ) {
      throw new ApiError('Development session cannot be refreshed.', 401);
    }

    // If a sibling request already completed a token rotation while this request
    // was in flight, reuse the newly stored token instead of refreshing again.
    const latestToken = getAccessToken();
    const alreadyRefreshedByPeer = Boolean(
      token && latestToken && latestToken !== token && !refreshRequest,
    );

    const refreshed = alreadyRefreshedByPeer ? true : await refreshSession();

    if (refreshed) {
      return apiRequest(path, { method, body, auth, retry: false });
    }

    // The workspace keeps the local session alive until the user explicitly
    // signs out. A rejected request must not force them back to the login page.
    throw new ApiError('This request was not authorized. You are still signed in.', 401);
  }

  const payload = await readJson(response);

  if (!response.ok) {
    throw new ApiError(
      sanitizeErrorMessage(payload?.message, `Request failed (HTTP ${response.status}).`),
      response.status,
      Array.isArray(payload?.errors) ? payload.errors : undefined,
    );
  }

  return payload;
}
