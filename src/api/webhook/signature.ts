/**
 * v0.0.1 - Placeholder (verifySignature() selalu return true --
 * SEMUA payload dianggap valid tanpa verifikasi apa pun).
 *
 * v0.2.0 - HMAC SHA256 Verification SUNGGUHAN.
 *
 * Dua metode didukung, karena source webhook yang berbeda
 * (lihat README.md: TradingView/Telegram/Discord/GitHub/AI
 * Service/Internal) punya kemampuan berbeda:
 *
 * 1. HEADER (verifyHeaderSignature) -- untuk source yang bisa
 *    kirim header custom (GitHub-style, internal automation).
 *    HMAC-SHA256 dari raw body, dibandingkan timing-safe.
 *
 * 2. BODY-EMBEDDED SECRET (verifyEmbeddedSecret) -- untuk source
 *    yang TIDAK BISA kirim header custom (mis. TradingView Alert
 *    -- cuma bisa kustomisasi isi body lewat alert message
 *    template). Payload wajib py field `secret` yang dibandingkan
 *    timing-safe ke WEBHOOK_SECRET.
 *
 * route.ts menerima kalau SALAH SATU dari dua metode ini valid.
 * Fail-closed: kalau WEBHOOK_SECRET tidak di-set, ATAU tidak ada
 * signature/secret yang cocok dikirim, request DITOLAK -- bukan
 * diam-diam diloloskan.
 */

import crypto from "crypto";

/**
 * Bandingkan dua string secara timing-safe (cegah timing attack
 * saat membandingkan signature/secret). Return false kalau
 * panjangnya beda (bukan exception) supaya pemanggil tetap dapat
 * boolean sederhana.
 */
function timingSafeEqualString(a: string, b: string): boolean {

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return crypto.timingSafeEqual(bufA, bufB);

}

export function verifyHeaderSignature(
  rawBody: string,
  providedSignatureHeader: string | null,
  secret: string
): boolean {

  if (!providedSignatureHeader || !secret) {
    return false;
  }

  // Dukung format "sha256=<hex>" (konvensi GitHub) maupun hex
  // polos saja.
  const provided = providedSignatureHeader.startsWith("sha256=")
    ? providedSignatureHeader.slice("sha256=".length)
    : providedSignatureHeader;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  try {
    return timingSafeEqualString(expected, provided);
  } catch {
    return false;
  }

}

export function verifyEmbeddedSecret(
  providedSecret: unknown,
  secret: string
): boolean {

  if (typeof providedSecret !== "string" || !providedSecret || !secret) {
    return false;
  }

  try {
    return timingSafeEqualString(providedSecret, secret);
  } catch {
    return false;
  }

}

/**
 * DEPRECATED -- placeholder lama, SELALU return true. Dibiarkan
 * ada (tidak dihapus) supaya tidak breaking import lama kalau
 * ada, TAPI JANGAN dipakai untuk keputusan keamanan apa pun.
 * route.ts sekarang pakai verifyHeaderSignature/
 * verifyEmbeddedSecret di atas.
 */
export function verifySignature() {

  return true;

}
