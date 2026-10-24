/**
 * Binary storage for brand files (briefs, logos, designs, videos…).
 *
 * Metadata (name, size, category, uploaded date) is kept with the brand
 * workspace; the bytes live in IndexedDB so large files never hit the
 * localStorage quota. When IndexedDB is unavailable the file is kept in
 * memory for the current session.
 */

const DB_NAME = 'orvia-brand-files';
const STORE = 'files';
const memory = new Map();

let dbPromise = null;

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);

  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    });
  }

  return dbPromise;
}

function runTransaction(db, mode, work) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const store = transaction.objectStore(STORE);
    let result;

    try {
      result = work(store);
    } catch (error) {
      reject(error);
      return;
    }

    transaction.oncomplete = () => resolve(result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

export async function saveFileBlob(id, file) {
  const db = await openDb();

  if (!db) {
    memory.set(id, file);
    return;
  }

  await runTransaction(db, 'readwrite', (store) => store.put(file, id));
}

export async function getFileBlob(id) {
  const db = await openDb();

  if (!db) return memory.get(id) ?? null;

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(id);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function removeFileBlob(id) {
  memory.delete(id);

  const db = await openDb();
  if (!db) return;

  try {
    await runTransaction(db, 'readwrite', (store) => store.delete(id));
  } catch {
    // A missing blob must never block removing the metadata.
  }
}

export function formatBytes(bytes = 0) {
  const value = Number(bytes) || 0;

  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;

  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
