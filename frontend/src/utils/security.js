/**
 * Core frontend security & input-hygiene utilities.
 * Pure, dependency-free helpers designed for single-responsibility reuse across
 * storage, network services, and view layers.
 */

const HTML_ESCAPE_MAP = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
});

const HTML_UNSAFE_PATTERN = /[&<>"']/g;

/**
 * Control characters (ASCII C0/DEL) stripped when normalizing untrusted URLs
 * so obfuscated schemes like `java\nscript:` or `\tdata:` cannot bypass checks.
 */
// eslint-disable-next-line no-control-regex
const URL_OBFUSCATION_CHARS = /[\u0000-\u0020\u007f]+/g;

/**
 * Non-printable ASCII control characters (excluding \t, \n, \r) removed from text inputs.
 */
// eslint-disable-next-line no-control-regex
const DISALLOWED_CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g;

const BLOCKED_SCHEME_PREFIXES = Object.freeze(['javascript:', 'data:', 'vbscript:', 'file:']);

const SENSITIVE_USER_FIELDS = Object.freeze([
  'password',
  'passwordHash',
  'accessToken',
  'refreshToken',
  'tokenHash',
]);

const ALWAYS_ALLOWED_AUTHENTICATED_PAGES = new Set(['notifications']);

/**
 * Escapes HTML metacharacters (`&`, `<`, `>`, `"`, `'`) to prevent XSS injection
 * when interpolating untrusted strings into markup.
 *
 * @param {unknown} value - Raw value to escape.
 * @returns {string} HTML-safe string.
 */
export function escapeHtml(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(HTML_UNSAFE_PATTERN, (char) => HTML_ESCAPE_MAP[char]);
}

/**
 * Validates and normalizes an untrusted URL for safe `href`/`src` rendering.
 * Permits `http:`, `https:`, fragment anchors (`#...`), and single-slash relative
 * paths (`/...`). Blocks dangerous schemes (`javascript:`, `data:`, `vbscript:`)
 * and protocol-relative (`//...`) redirects.
 *
 * @param {unknown} url - Candidate URL string.
 * @param {string} [fallback='#'] - Fallback returned when the URL is unsafe or empty.
 * @returns {string} Safe URL string or `fallback`.
 */
export function sanitizeSafeUrl(url, fallback = '#') {
  if (typeof url !== 'string') return fallback;

  const trimmed = url.trim();
  if (!trimmed) return fallback;

  const compacted = trimmed.replace(URL_OBFUSCATION_CHARS, '').toLowerCase();
  if (!compacted) return fallback;

  if (BLOCKED_SCHEME_PREFIXES.some((prefix) => compacted.startsWith(prefix))) {
    return fallback;
  }

  // Allow in-page hash anchors (`#`, `#section`).
  if (trimmed.startsWith('#')) {
    return trimmed;
  }

  // Allow root-relative paths (`/assets/guide.pdf`), but reject protocol-relative
  // (`//evil.example`) and backslash-smuggled (`/\evil.example`) URLs.
  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
      return fallback;
    }
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return trimmed;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

/**
 * Strips non-printable control characters, trims surrounding whitespace, and
 * enforces a deterministic maximum character length on user text inputs.
 *
 * @param {unknown} value - Raw user input.
 * @param {number} [maxLen=1000] - Maximum allowed string length.
 * @returns {string} Cleaned, bounded text string.
 */
export function sanitizeTextInput(value, maxLen = 1000) {
  if (value === null || value === undefined) return '';

  const cleaned = String(value).replace(DISALLOWED_CONTROL_CHARS, '').trim();
  const limit =
    typeof maxLen === 'number' && Number.isFinite(maxLen) && maxLen >= 0 ? maxLen : 1000;

  return cleaned.slice(0, limit);
}

/**
 * Returns a shallow clone of a user object with sensitive credential/token fields
 * (`password`, `passwordHash`, `accessToken`, `refreshToken`, `tokenHash`) removed.
 * Never mutates the caller's object.
 *
 * @param {Record<string, unknown> | null | undefined} user - Candidate user object.
 * @returns {Record<string, unknown> | null} Sanitized user object, or `null` if invalid.
 */
export function stripSensitiveUserFields(user) {
  if (!user || typeof user !== 'object' || Array.isArray(user)) {
    return null;
  }

  const sanitized = { ...user };
  for (const field of SENSITIVE_USER_FIELDS) {
    delete sanitized[field];
  }

  return sanitized;
}

/**
 * Resolves the route list configured for `role` within `navMap`, supporting both
 * exact and case-insensitive role keys.
 *
 * @param {string} role
 * @param {Record<string, Array<string | { id?: string, page?: string }>>} navMap
 * @returns {Array<string | { id?: string, page?: string }> | null}
 */
function resolveRoleNavEntries(role, navMap) {
  if (Array.isArray(navMap[role])) return navMap[role];

  const targetLower = role.toLowerCase();
  const matchedKey = Object.keys(navMap).find((key) => key.toLowerCase() === targetLower);
  if (matchedKey && Array.isArray(navMap[matchedKey])) {
    return navMap[matchedKey];
  }

  return null;
}

/**
 * Checks whether a given `role` is permitted to access `page` according to `navMap`.
 * Valid roles also retain access to shared utility routes such as `'notifications'`.
 *
 * @param {unknown} role - Current user role identifier.
 * @param {unknown} page - Target page/route identifier.
 * @param {Record<string, Array<string | { id?: string, page?: string }>>} navMap - Role-to-routes map.
 * @returns {boolean} `true` when access is allowed, otherwise `false`.
 */
export function isRouteAllowedForRole(role, page, navMap) {
  if (typeof role !== 'string' || typeof page !== 'string') return false;
  if (!navMap || typeof navMap !== 'object' || Array.isArray(navMap)) return false;

  const trimmedRole = role.trim();
  const trimmedPage = page.trim();
  if (!trimmedRole || !trimmedPage) return false;

  const allowedEntries = resolveRoleNavEntries(trimmedRole, navMap);
  if (!allowedEntries) return false;

  if (ALWAYS_ALLOWED_AUTHENTICATED_PAGES.has(trimmedPage)) {
    return true;
  }

  return allowedEntries.some((entry) => {
    if (typeof entry === 'string') return entry === trimmedPage;
    if (entry && typeof entry === 'object') {
      return entry.id === trimmedPage || entry.page === trimmedPage;
    }
    return false;
  });
}
