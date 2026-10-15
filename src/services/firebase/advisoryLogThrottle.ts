/**
 * Throttle log advisory (observability-only), per pair.
 *
 * `[Trend+Volume Advisory PAIR]` dan `[ML Advisory PAIR]` ditulis ke
 * Firestore untuk SETIAP pair kandidat di SETIAP siklus (tiap menit).
 * Keduanya murni informasi (bukan gate BUY/SELL), jadi cukup satu kali
 * per pair per jendela waktu. Menghemat write Firestore (Spark 20K/hari).
 *
 * Hanya pesan dengan prefix advisory yang di-throttle. Log lain
 * (trade, order, alarm, error) SELALU ditulis. State in-memory per
 * instance serverless: kalau instance dingin, log tertulis (gagal-aman
 * ke arah "lebih banyak log", bukan lebih sedikit).
 */

export const ADVISORY_LOG_INTERVAL_MS = 5 * 60 * 1000;

const ADVISORY_PREFIX = /^\[(Trend\+Volume Advisory|ML Advisory) ([^\]]+)\]/;

const lastWritten = new Map<string, number>();

/** Kunci throttle (jenis+pair) atau null bila pesan bukan log advisory. */
export function advisoryKey(message: string): string | null {
  const m = ADVISORY_PREFIX.exec(message);
  return m ? `${m[1]}|${m[2]}` : null;
}

export function shouldWriteLog(
  type: string,
  message: string,
  now: number = Date.now(),
  intervalMs: number = ADVISORY_LOG_INTERVAL_MS
): boolean {
  if (type !== "info") return true;

  const key = advisoryKey(message);
  if (key === null) return true;

  const last = lastWritten.get(key);
  if (last !== undefined && now - last < intervalMs) return false;

  lastWritten.set(key, now);
  return true;
}

/** Hanya untuk test. */
export function resetAdvisoryThrottle(): void {
  lastWritten.clear();
}
