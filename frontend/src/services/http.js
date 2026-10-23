import { getAccessToken, getRefreshToken, setSession } from './tokenStorage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// The Express API mounts its routers directly on `/api` and currently exposes
// no token-refresh route. Keep the retry plumbing in place for when it lands.
const REFRESH_ENDPOINT_AVAILABLE = false;

export const SESSION_EXPIRED_EVENT = 'orvia:session-expired';

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function readJson(response) {
  if (response.status === 204) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

let refreshRequest = null;

/**
 * Refreshes once and shares the in-flight promise so parallel 401s do not
 * invalidate a freshly rotated refresh token.
 */
async function refreshSession() {
  if (!REFRESH_ENDPOINT_AVAILABLE) return false;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  if (!refreshRequest) {
    refreshRequest = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (response) => {
        if (!response.ok) return false;

        const body = await readJson(response);
        if (!body?.data?.accessToken) return false;

        setSession({
          accessToken: body.data.accessToken,
          refreshToken: body.data.refreshToken,
          user: body.data.user,
        });
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

/**
 * Every backend call goes through here: JSON in/out, bearer token, one retry
 * after a refresh, and one error shape for the UI.
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

  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Network request failed. Check your connection and try again.', 0);
  }

  if (response.status === 401 && auth && retry) {
    if (
      import.meta.env.DEV &&
      import.meta.env.VITE_DEV_BYPASS_LOGIN === 'true' &&
      token === 'dev-bypass-token'
    ) {
      throw new ApiError('Development session cannot be refreshed.', 401);
    }

    const refreshed = await refreshSession();

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
      payload?.message || `Request failed (HTTP ${response.status}).`,
      response.status,
    );
  }

  return payload;
}
