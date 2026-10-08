/**
==========================================================
AURA Trade OS
Cron / Machine-to-Machine Auth
Version : 0.1.0
==========================================================
Satu-satunya tempat verifikasi header
"Authorization: Bearer <CRON_SECRET>" untuk semua endpoint yang
dipicu mesin (cron-job.org, GitHub Actions, scheduler lokal di
server fisik, trigger manual).

Sengaja TIDAK memakai tipe Next (NextApiRequest / Request) --
cuma menerima nilai header -- supaya bisa dipakai oleh Pages
Router, App Router, maupun server Node biasa.

Kontrak hasil:
  ok:true            -> lanjut
  status 500         -> CRON_SECRET belum di-set (kesalahan
                        konfigurasi server, BUKAN salah token)
  status 401         -> header hilang / salah
==========================================================
*/

import { timingSafeEqual } from "node:crypto";

export type CronAuthResult =
  | { ok: true }
  | {
      ok: false;
      status: 401 | 500;
      /** Pesan aman untuk dikirim ke client. */
      error: string;
      /** Detail diagnostik untuk log server (tanpa isi secret). */
      logMessage: string;
    };

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  if (bufA.length !== bufB.length) {
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

/**
 * @param authorizationHeader nilai header Authorization mentah
 * @param label nama endpoint untuk prefix log, mis. "CRON SCAN"
 */
export function verifyCronSecret(
  authorizationHeader: string | null | undefined,
  label: string
): CronAuthResult {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return {
      ok: false,
      status: 500,
      error: "Server misconfigured: CRON_SECRET not set",
      logMessage: `[${label}] CRON_SECRET belum di-set di environment server.`,
    };
  }

  const received = authorizationHeader?.trim() ?? "";
  const expected = `Bearer ${cronSecret}`;

  if (!safeEqual(received, expected)) {
    return {
      ok: false,
      status: 401,
      error: "Unauthorized",
      logMessage:
        `[${label}] Unauthorized. ` +
        `Panjang header diterima: ${authorizationHeader?.length ?? 0} (setelah trim: ${received.length}). ` +
        `Panjang token diharapkan: ${expected.length}. ` +
        "Cek apakah secret di pemanggil (GitHub Actions / cron-job.org / scheduler lokal) persis sama dengan " +
        "env var CRON_SECRET di server (case-sensitive, tanpa spasi/newline ekstra), dan scope environment-nya benar.",
    };
  }

  return { ok: true };
}
