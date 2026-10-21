/**
 * The single place that touches persisted credentials.
 * Swapping localStorage for httpOnly cookies should only require editing this file.
 */
const ACCESS_TOKEN_KEY = 'agency_access_token';
const REFRESH_TOKEN_KEY = 'agency_refresh_token';
const USER_KEY = 'agency_user';

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be unavailable (private mode, file://). The session simply
    // stays in memory for this tab, which is still safe.
  }
}

function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore: nothing to clean up.
  }
}

export function getAccessToken() {
  return read(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return read(REFRESH_TOKEN_KEY);
}

export function getStoredUser() {
  const raw = read(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    remove(USER_KEY);
    return null;
  }
}

export function hasStoredSession() {
  return Boolean(getAccessToken() && getStoredUser());
}

export function setSession({ accessToken, refreshToken, user }) {
  if (accessToken) write(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) write(REFRESH_TOKEN_KEY, refreshToken);
  if (user) write(USER_KEY, JSON.stringify(user));
}

export function setStoredUser(user) {
  write(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  remove(ACCESS_TOKEN_KEY);
  remove(REFRESH_TOKEN_KEY);
  remove(USER_KEY);
}
