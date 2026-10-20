/**
 * Sampling log RUTIN per pair - TANPA state (aman untuk serverless).
 *
 * Diukur 2026-10-20 (lastWriteCounts): satu siklus scan menulis ~80 log
 * aktivitas (~85% dari semua write Firestore). Hampir semuanya log rutin
 * per pair yang isinya sama tiap siklus (started, Confidence Info,
 * Trend+Volume, ML, AI advisory, HOLD, ...). Cron berjalan tiap 10 menit
 * dan instance Vercel dingin di antaranya, jadi throttle berbasis memori
 * tidak pernah bekerja. Di sini keputusan murni fungsi waktu + nama pair:
 * tiap pair menulis log rutin pada 1 dari SAMPLE_EVERY jendela
 * SAMPLE_BUCKET_MS, bergiliran antar pair (beban write merata).
 *
 * Hanya log info/success yang polanya dikenali di bawah yang disampling.
 * Trade, order, sanity check, warning, danger, dan error SELALU ditulis.
 */

export const SAMPLE_BUCKET_MS = 10 * 60 * 1000;
export const SAMPLE_EVERY = 6; // 6 x 10 menit = sekali per jam per pair

const ROUTINE =
  /^(?:\[(?:Trend\+Volume Advisory|ML Advisory|AI Advisory|AI Explainability|AI Consensus|Effective Config|Confidence Info) ([^\]]+)\]|Cron execution started \(([^)]+)\)|HOLD ([A-Za-z0-9_]+)\s*$)/;

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = (h * 31 + text.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Nama pair bila pesan adalah log rutin per pair, selain itu null. */
export function routinePair(message: string): string | null {
  const m = ROUTINE.exec(message);
  if (!m) return null;
  return (m[1] ?? m[2] ?? m[3] ?? "").toLowerCase() || null;
}

/** Giliran pair ini menulis log rutin pada jendela waktu `now`? */
export function isSampleTurn(pair: string, now: number = Date.now()): boolean {
  const bucket = Math.floor(now / SAMPLE_BUCKET_MS);
  return (bucket + hash(pair.toLowerCase())) % SAMPLE_EVERY === 0;
}

export function shouldWriteLog(
  type: string,
  message: string,
  now: number = Date.now()
): boolean {
  if (type !== "info" && type !== "success") return true;
  const pair = routinePair(message);
  if (pair === null) return true;
  return isSampleTurn(pair, now);
}
