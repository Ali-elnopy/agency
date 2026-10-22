// Profile photos are processed in the browser and kept in localStorage.
//
// The Express API does not expose a file/upload endpoint or static hosting for
// user media yet (multer is installed but unused), so a photo picked in the UI
// is validated, downscaled on a canvas and persisted against the member email.
// Values:
//   undefined -> never set
//   ''        -> explicitly removed
//   data URL  -> current photo

export const AVATAR_EVENT = 'orvia:avatar-change';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const STORAGE_KEY = 'agency_avatars';
const MAX_EDGE = 512;

export function avatarKey(email) {
  return String(email ?? '')
    .trim()
    .toLowerCase();
}

function readAll() {
  if (typeof window === 'undefined') return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(next) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    throw new Error('This photo is too large to store in your browser. Try a smaller image.');
  }

  window.dispatchEvent(new CustomEvent(AVATAR_EVENT));
}

export function getAvatar(email) {
  const key = avatarKey(email);
  if (!key) return undefined;
  return Object.prototype.hasOwnProperty.call(readAll(), key) ? readAll()[key] : undefined;
}

export function saveAvatar(email, dataUrl) {
  const key = avatarKey(email);
  if (!key) throw new Error('Sign in again before uploading a photo.');

  const next = readAll();
  next[key] = dataUrl;
  writeAll(next);
}

export function clearAvatar(email) {
  const key = avatarKey(email);
  if (!key) return;

  const next = readAll();
  next[key] = '';
  writeAll(next);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That file could not be read as an image.'));
    image.src = src;
  });
}

function render(image, square) {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;

  if (!width || !height) throw new Error('That image has no visible pixels.');

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (square) {
    const side = Math.min(width, height);
    const size = Math.min(MAX_EDGE, side);
    canvas.width = size;
    canvas.height = size;
    context.drawImage(image, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size);
  } else {
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
  }

  return canvas.toDataURL('image/jpeg', 0.88);
}

/** Read a File picked by the user, validate it and return a compact data URL. */
export async function fileToAvatar(file) {
  if (!file) throw new Error('Choose an image file first.');

  if (!String(file.type || '').startsWith('image/')) {
    throw new Error('Please choose a PNG, JPG or WebP image.');
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is larger than 5MB. Please choose a smaller file.');
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    return render(image, false);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/** Centre-crop the current photo to a 1:1 square. */
export async function cropAvatar(dataUrl) {
  if (!dataUrl) throw new Error('Upload a photo before cropping.');

  const image = await loadImage(dataUrl);
  return render(image, true);
}
