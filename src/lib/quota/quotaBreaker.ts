/**
 * Pemutus (circuit breaker) untuk endpoint cron saat Firestore bermasalah,
 * terutama kuota harian paket gratis habis. Tanpa ini, pembacaan Firestore
 * mencoba ulang berulang sampai cron-job.org menyerah di 30 detik
 * ("Failed (timeout)"), dan tiap percobaan menumpuk di server.
 *
 * Perilaku:
 * - error kuota (RESOURCE_EXHAUSTED / "Quota exceeded") -> pemutus menutup
 *   selama QUOTA_COOLDOWN_MS; panggilan berikutnya langsung dibalas 503.
 * - handler melewati batas waktu 2 kali beruntun -> diperlakukan sama.
 * - satu respons sukses mereset hitungan.
 * Status disimpan di memori instance (cukup untuk menahan gelombang percobaan
 * ulang); tidak menulis apa pun ke Firestore.
 */
import type { NextApiRequest, NextApiResponse } from "next";

export const QUOTA_COOLDOWN_MS = 3 * 60 * 1000;
export const HANDLER_DEADLINE_MS = 25_000;
const TIMEOUTS_BEFORE_TRIP = 2;

export function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; message?: unknown };
  if (e.code === 8 || e.code === "resource-exhausted") return true;
  const msg = typeof e.message === "string" ? e.message : "";
  return /RESOURCE_EXHAUSTED|quota exceeded|resource-exhausted/i.test(msg);
}

/** Kuota harian Firestore reset tengah malam Pasifik = 07:00 UTC (PDT) / 08:00 UTC (PST). */
export function msUntilQuotaReset(nowMs: number, resetUtcHour = 7): number {
  const d = new Date(nowMs);
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), resetUtcHour);
  return (next > nowMs ? next : next + 24 * 3600 * 1000) - nowMs;
}

export class QuotaBreaker {
  private openUntil = 0;
  private consecutiveTimeouts = 0;

  isOpen(nowMs: number): boolean {
    return nowMs < this.openUntil;
  }
  retryAfterSec(nowMs: number): number {
    return Math.max(1, Math.ceil((this.openUntil - nowMs) / 1000));
  }
  trip(nowMs: number): void {
    this.openUntil = nowMs + QUOTA_COOLDOWN_MS;
    this.consecutiveTimeouts = 0;
  }
  recordTimeout(nowMs: number): void {
    this.consecutiveTimeouts += 1;
    if (this.consecutiveTimeouts >= TIMEOUTS_BEFORE_TRIP) this.trip(nowMs);
  }
  recordSuccess(): void {
    this.consecutiveTimeouts = 0;
  }
}

type Handler = (req: NextApiRequest, res: NextApiResponse) => unknown | Promise<unknown>;

const TIMED_OUT = Symbol("timed-out");

/** Bungkus handler cron: fail-fast saat kuota/Firestore bermasalah, batas waktu 25 detik. */
export function withQuotaGuard(
  label: string,
  handler: Handler,
  breaker: QuotaBreaker = new QuotaBreaker(),
  deadlineMs: number = HANDLER_DEADLINE_MS
) {
  return async function guarded(req: NextApiRequest, res: NextApiResponse) {
    const now = Date.now();

    if (breaker.isOpen(now)) {
      res.setHeader("Retry-After", String(breaker.retryAfterSec(now)));
      return res.status(503).json({
        error: "Dilewati: Firestore sedang bermasalah/kuota habis, dicoba lagi otomatis.",
        skipped: "quota",
        retryAfterSec: breaker.retryAfterSec(now),
        quotaResetInMin: Math.round(msUntilQuotaReset(now) / 60_000),
      });
    }

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const outcome = await Promise.race([
        Promise.resolve(handler(req, res)),
        new Promise<typeof TIMED_OUT>((resolve) => {
          timer = setTimeout(() => resolve(TIMED_OUT), deadlineMs);
        }),
      ]);

      if (outcome === TIMED_OUT) {
        breaker.recordTimeout(Date.now());
        console.error(`[${label}] melewati batas ${deadlineMs}ms -- kemungkinan Firestore lambat/kuota habis.`);
        if (!res.writableEnded) {
          return res.status(504).json({ error: "Timeout: siklus melewati batas waktu.", timeoutMs: deadlineMs });
        }
        return;
      }

      if (res.statusCode >= 200 && res.statusCode < 300) breaker.recordSuccess();
    } catch (err) {
      if (isQuotaError(err)) {
        breaker.trip(Date.now());
        console.error(`[${label}] kuota Firestore habis -- pemutus aktif ${QUOTA_COOLDOWN_MS / 1000}s.`);
        if (!res.writableEnded) {
          return res.status(503).json({ error: "Kuota Firestore habis.", skipped: "quota" });
        }
        return;
      }
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  };
}
