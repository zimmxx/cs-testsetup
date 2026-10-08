export function readLocal(key, fallback) {
  try { const raw = localStorage.getItem(`cs-testsetup:v1:${key}`); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}
export function writeLocal(key, value) {
  try { localStorage.setItem(`cs-testsetup:v1:${key}`, JSON.stringify(value)); return true; } catch { return false; }
}
export function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  return [...bytes].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
export function downloadFile(name, value, type = 'application/json') {
  const blob = value instanceof Blob ? value : new Blob([typeof value === 'string' ? value : JSON.stringify(value, null, 2)], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function openLibrary() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cs-testsetup-documents-v1', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('documents', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function documentStore(action, value) {
  const db = await openLibrary();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', action === 'list' ? 'readonly' : 'readwrite');
    const store = tx.objectStore('documents');
    const req = action === 'list' ? store.getAll() : action === 'remove' ? store.delete(value) : store.put(value);
    let result;
    req.onsuccess = () => { result = req.result; };
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('Document transaction was interrupted.')); };
  });
}
