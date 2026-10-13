/**
 * Pembatas frekuensi per-instance untuk pekerjaan opsional yang tidak perlu
 * jalan tiap siklus (hemat kuota baca/tulis Firestore). Status disimpan di
 * memori instance serverless yang hangat; instance baru (cold start) boleh
 * langsung menjalankan sekali -- aman, hanya berarti sesekali lebih sering.
 */
export function shouldRunEvery(lastRunMs: number, nowMs: number, intervalMs: number): boolean {
  return lastRunMs <= 0 || nowMs - lastRunMs >= intervalMs;
}

const lastRuns = new Map<string, number>();

/** Mengembalikan true (dan menandai waktu) bila job `key` sudah waktunya jalan. */
export function claimInterval(key: string, intervalMs: number, nowMs: number = Date.now()): boolean {
  if (!shouldRunEvery(lastRuns.get(key) ?? 0, nowMs, intervalMs)) return false;
  lastRuns.set(key, nowMs);
  return true;
}
