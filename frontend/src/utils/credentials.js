/**
 * Credentials helpers shared by the "add member" and "add user" screens.
 *
 * A temporary password is generated in the browser because the API expects the
 * administrator to choose one when provisioning an account. It must satisfy the
 * server policy: 12+ characters with a lowercase letter, an uppercase letter, a
 * digit and a symbol.
 */

const LOWER = 'abcdefghjkmnpqrstuvwxyz';
const UPPER = 'ABCDEFGHJKMNPQRSTUVWXYZ';
const DIGITS = '23456789';
const SYMBOLS = '!@#$%&*?';
const ALL = LOWER + UPPER + DIGITS + SYMBOLS;

export const TEMP_PASSWORD_LENGTH = 16;

function randomIndex(max) {
  const crypto = globalThis.crypto;

  if (crypto?.getRandomValues) {
    const buffer = new Uint32Array(1);
    // Rejection sampling keeps the distribution uniform instead of folding the
    // 32-bit value with a modulo.
    const limit = Math.floor(0x100000000 / max) * max;

    do {
      crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return buffer[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function pick(source) {
  return source[randomIndex(source.length)];
}

function shuffle(chars) {
  for (let index = chars.length - 1; index > 0; index -= 1) {
    const swap = randomIndex(index + 1);
    [chars[index], chars[swap]] = [chars[swap], chars[index]];
  }

  return chars;
}

export function generateTemporaryPassword() {
  // One guaranteed character per class, then random filler, then shuffled so
  // the guaranteed characters are not always in the same positions.
  const chars = [pick(LOWER), pick(UPPER), pick(DIGITS), pick(SYMBOLS)];

  while (chars.length < TEMP_PASSWORD_LENGTH) chars.push(pick(ALL));

  return shuffle(chars).join('');
}

/**
 * Copies text to the clipboard, falling back to a hidden textarea on browsers
 * that block the async clipboard API (or when the page is not a secure origin).
 */
export async function copyToClipboard(text) {
  const value = String(text ?? '');

  if (!value) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to the legacy path below.
  }

  try {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(area);
    return copied;
  } catch {
    return false;
  }
}
