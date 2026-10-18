/**
 * Throttle log advisory (observability-only), per pair.
 *
 * `[Trend+Volume Advisory PAIR]`, `[ML Advisory PAIR]`, `[AI Advisory/Explainability/Consensus PAIR]` dan `[Effective Config PAIR]` ditulis ke
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

// Semua log observability per-pair yang ditulis tiap siklus untuk tiap
// pair kandidat. Murni informasi, tidak pernah dipakai sebagai gate.
const ADVISORY_PREFIX =
  /^\[(Trend\+Volume Advisory|ML Advisory|AI Advisory|AI Explainability|AI Consensus|Effective Config) ([^\]]+)\]/;

const lastWritten = new Map<string, number>();

/** Kunci throttle (jenis+pair) atau null bila pesan bukan log advisory. */
export function advisoryKey(message: string): string | null {
  const m = ADVISORY_PREFIX.exec(message);
  return m ? `${m[1]}|${m[2]}` : null;
}

/**
 * Jendela penekanan duplikat persis. Log info/success dengan TEKS SAMA
 * PERSIS untuk pesan yang sama tidak membawa informasi baru, jadi hanya
 * ditulis ulang setelah jendela ini lewat. Tiap pair tiap siklus,
 * cron.ts menulis "Cron execution started", "Trading Engine ... HOLD",
 * "[Confidence Info]" dst. - ini yang paling banyak memakan write.
 */
export const DUPLICATE_LOG_WINDOW_MS = 10 * 60 * 1000;
const MAX_TRACKED = 500;

const lastExact = new Map<string, number>();

function pruneExact(now: number, windowMs: number): void {
  if (lastExact.size <= MAX_TRACKED) return;
  for (const [k, t] of lastExact) {
    if (now - t >= windowMs) lastExact.delete(k);
  }
}

export function shouldWriteLog(
  type: string,
  message: string,
  now: number = Date.now(),
  intervalMs: number = ADVISORY_LOG_INTERVAL_MS,
  duplicateWindowMs: number = DUPLICATE_LOG_WINDOW_MS
): boolean {
  // warning / danger / error: SELALU ditulis.
  if (type !== "info" && type !== "success") return true;

  // 1) Advisory per-pair (hanya info): sekali per interval per pair+jenis.
  if (type === "info") {
    const key = advisoryKey(message);
    if (key !== null) {
      const last = lastWritten.get(key);
      if (last !== undefined && now - last < intervalMs) return false;
      lastWritten.set(key, now);
      return true;
    }
  }

  // 2) Duplikat persis (info/success): tekan dalam jendela.
  const exactKey = `${type}|${message}`;
  const prev = lastExact.get(exactKey);
  if (prev !== undefined && now - prev < duplicateWindowMs) return false;
  lastExact.set(exactKey, now);
  pruneExact(now, duplicateWindowMs);
  return true;
}

/** Hanya untuk test. */
export function resetAdvisoryThrottle(): void {
  lastWritten.clear();
  lastExact.clear();
}
