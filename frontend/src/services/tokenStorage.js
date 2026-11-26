import { stripSensitiveUserFields } from '../utils/security';

/**
 * The single place that touches persisted credentials.
 * Swapping localStorage for httpOnly cookies should only require editing this file.
 */
const ACCESS_TOKEN_KEY = 'agency_access_token';
const REFRESH_TOKEN_KEY = 'agency_refresh_token';
const USER_KEY = 'agency_user';

const MAX_TOKEN_LENGTH = 4096;
// Rejects whitespace and ASCII control characters inside bearer/refresh token strings.
// eslint-disable-next-line no-control-regex
const INVALID_TOKEN_CHARS = /[\s\u0000-\u001f\u007f]/;

/**
 * Validates and trims a candidate token string without logging or echoing its value.
 *
 * @param {unknown} token
 * @returns {string | null}
 */
function normalizeToken(token) {
  if (typeof token !== 'string') return null;

  const trimmed = token.trim();
  if (!trimmed || trimmed.length > MAX_TOKEN_LENGTH) return null;
  if (trimmed === 'null' || trimmed === 'undefined') return null;
  if (INVALID_TOKEN_CHARS.test(trimmed)) return null;

  return trimmed;
}

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
    // stays in memory for this tab, which is still safe. Never log raw values.
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
  const raw = read(ACCESS_TOKEN_KEY);
  if (raw === null) return null;

  const valid = normalizeToken(raw);
  if (!valid) {
    remove(ACCESS_TOKEN_KEY);
    return null;
  }

  return valid;
}

export function getRefreshToken() {
  const raw = read(REFRESH_TOKEN_KEY);
  if (raw === null) return null;

  const valid = normalizeToken(raw);
  if (!valid) {
    remove(REFRESH_TOKEN_KEY);
    return null;
  }

  return valid;
}

export function getStoredUser() {
  const raw = read(USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const sanitized = stripSensitiveUserFields(parsed);
    if (!sanitized) {
      remove(USER_KEY);
      return null;
    }
    return sanitized;
  } catch {
    remove(USER_KEY);
    return null;
  }
}

export function hasStoredSession() {
  return Boolean(getAccessToken() && getStoredUser());
}

export function setSession({ accessToken, refreshToken, user } = {}) {
  const safeAccessToken = normalizeToken(accessToken);
  const safeRefreshToken = normalizeToken(refreshToken);
  const safeUser = stripSensitiveUserFields(user);

  if (safeAccessToken) write(ACCESS_TOKEN_KEY, safeAccessToken);
  if (safeRefreshToken) write(REFRESH_TOKEN_KEY, safeRefreshToken);
  if (safeUser) write(USER_KEY, JSON.stringify(safeUser));
}

export function setStoredUser(user) {
  const safeUser = stripSensitiveUserFields(user);
  if (!safeUser) {
    remove(USER_KEY);
    return;
  }

  write(USER_KEY, JSON.stringify(safeUser));
}

export function clearSession() {
  remove(ACCESS_TOKEN_KEY);
  remove(REFRESH_TOKEN_KEY);
  remove(USER_KEY);
}

function profilePhotoKey(userId) {
  return `agency_profile_photo_${String(userId ?? '')}`;
}

export function getStoredProfilePhoto(userId) {
  if (userId === undefined || userId === null || userId === '') return undefined;
  const raw = read(profilePhotoKey(userId));
  return raw === null ? undefined : raw;
}

export function setStoredProfilePhoto(userId, photo) {
  if (userId === undefined || userId === null || userId === '') return;
  if (photo === undefined || photo === null) {
    remove(profilePhotoKey(userId));
    return;
  }
  write(profilePhotoKey(userId), String(photo));
}
