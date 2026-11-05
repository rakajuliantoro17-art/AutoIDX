/**
 * Cache TTL pendek per instance serverless untuk dokumen kecil yang dibaca
 * ulang tiap pair dalam satu siklus (control, risk state, settings).
 * Hanya hasil baca SUKSES yang disimpan; kegagalan tidak pernah di-cache.
 * Tulisan dari proses yang sama harus memanggil invalidate().
 */
interface Entry<T> {
  at: number;
  value: T;
}

const store = new Map<string, Entry<unknown>>();

export function getCached<T>(key: string, ttlMs: number, now = Date.now()): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (now - hit.at > ttlMs) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function setCached<T>(key: string, value: T, now = Date.now()): void {
  store.set(key, { at: now, value });
}

export function invalidateCached(key: string): void {
  store.delete(key);
}

export function clearAllCached(): void {
  store.clear();
}
