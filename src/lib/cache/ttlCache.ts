/**
 * Cache memori sederhana per instance serverless, untuk menekan pembacaan
 * Firestore (paket gratis dibatasi 50.000 baca/hari). Semua pengguna yang
 * memanggil endpoint yang sama dalam jendela TTL berbagi satu hasil.
 */
const store = new Map<string, { at: number; value: unknown }>();

export async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && now - hit.at < ttlMs) return hit.value as T;
  const value = await load();
  store.set(key, { at: now, value });
  return value;
}
