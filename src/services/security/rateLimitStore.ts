/**
==========================================================
AURA Trade OS
Rate Limit Store (Admin SDK, server-only)
Version : 0.1.0 Alpha

services/security/rateLimiter.ts (class RateLimiter) sebelumnya
orphan total - dan in-memory (Map biasa), yang di serverless
Vercel PERCUMA: tiap invocation baru = memory kosong lagi, jadi
limitnya nyaris tidak pernah benar-benar tercapai walau di-spam
sekalipun. File ini bikin versi yang benar-benar menghitung
lintas invocation, pakai Firestore transaction (atomic) supaya
aman dari race condition kalau ada 2 request nyaris bersamaan.

FAIL-OPEN dengan sengaja: kalau Firestore lagi error/lambat,
request tetap DIIZINKAN (bukan diblokir) - rate limiting di
sini cuma lapis pertahanan tambahan (defense in depth), BUKAN
kontrol keamanan utama (itu tugas verifyApiAuth/Firebase ID
Token). Fail-closed di sini cuma akan bikin fitur mati total
kalau Firestore lagi ada gangguan, tanpa manfaat keamanan
sepadan.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  message: string;
}

const COLLECTION = "rate_limits";

/**
 * Cek + increment counter rate limit untuk `key` dalam window
 * `windowMs`, dibatasi `limit` request. Pakai Firestore
 * transaction supaya atomic.
 *
 * @param key - identifier unik, mis. `ml_train:${uid}`
 * @param limit - jumlah maksimum request dalam satu window
 * @param windowMs - lebar window dalam milidetik
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const now = Date.now();
  const ref = adminDb.collection(COLLECTION).doc(key);

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref);
      const data = snapshot.exists ? (snapshot.data() as { count: number; expiresAt: number }) : null;

      // Window belum ada / sudah kedaluwarsa -> mulai window baru.
      if (!data || now >= data.expiresAt) {
        const expiresAt = now + windowMs;

        tx.set(ref, { count: 1, expiresAt });

        return {
          allowed: true,
          remaining: limit - 1,
          resetAt: expiresAt,
          message: "OK",
        };
      }

      // Masih dalam window yang sama, sudah kena limit.
      if (data.count >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: data.expiresAt,
          message: "Terlalu banyak permintaan - coba lagi nanti.",
        };
      }

      tx.update(ref, { count: data.count + 1 });

      return {
        allowed: true,
        remaining: limit - (data.count + 1),
        resetAt: data.expiresAt,
        message: "OK",
      };
    });

    return result;
  } catch (error) {
    // Fail-open (lihat komentar di atas file).
    console.error(`[RateLimitStore] Gagal cek rate limit untuk "${key}" (fail-open, request diizinkan):`, error);

    return {
      allowed: true,
      remaining: -1,
      resetAt: now + windowMs,
      message: "Rate limit check gagal (fail-open).",
    };
  }
}

export default { checkRateLimit };
