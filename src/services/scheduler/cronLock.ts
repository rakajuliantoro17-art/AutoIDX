/**
==========================================================
AURA Trade OS
Cron Distributed Lock
Version : 0.1.0

Mencegah 2 eksekusi /api/cron/scan berjalan bersamaan
(overlap) ketika trigger eksternal seperti cron-job.org
menembak lebih cepat dari durasi 1 siklus eksekusi.

Karena Vercel serverless bisa menjalankan tiap request di
instance/container yang berbeda, lock TIDAK BISA memakai
variabel in-memory biasa (setiap instance punya memori
sendiri-sendiri) - harus memakai penyimpanan bersama
(Firestore), dikoordinasikan lewat transaction supaya
tidak ada race condition antara 2 request yang datang
nyaris bersamaan.

TTL dipakai supaya kalau 1 eksekusi crash/timeout tanpa
sempat melepas lock, lock tersebut otomatis dianggap basi
dan siklus berikutnya tetap bisa jalan (tidak macet
selamanya).
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const LOCK_COLLECTION = "systemLocks";
const LOCK_DOC_ID = "cronScan";

const LOCK_TTL_MS = 25_000;

/**
 * Jarak minimum antar-siklus scan (detik di env
 * CRON_SCAN_MIN_INTERVAL_SECONDS, default 60, minimum 10). Dipakai
 * cron/scan.ts untuk throttle DAN cronHeartbeat.ts sebagai interval
 * yang diharapkan, supaya ambang ALIVE/STALE/DEAD ikut menyesuaikan.
 */
export function getScanMinIntervalMs(): number {
  const raw = Number(process.env.CRON_SCAN_MIN_INTERVAL_SECONDS);
  const seconds = Number.isFinite(raw) && raw > 0 ? raw : 60;
  return Math.max(10, seconds) * 1000;
}

export interface CronLockHandle {
  readonly acquired: boolean;
  /** Kenapa lock tidak didapat: "running" = siklus lain masih jalan, "throttled" = terlalu cepat sejak siklus terakhir. */
  readonly reason?: "running" | "throttled";
  readonly runId: string;
  readonly release: () => Promise<void>;
}

function createRunId(): string {
  return [
    "run",
    Date.now().toString(36),
    Math.random().toString(36).slice(2, 8),
  ].join("-");
}

/**
 * @param minIntervalMs Jarak minimum antar-MULAI siklus. Kalau request
 * datang lebih cepat dari ini, ditolak dengan reason "throttled"
 * (hanya 1 transaksi Firestore kecil, TANPA scan market). Ini batas
 * pengaman biaya Vercel Fluid Active CPU: seberapa pun sering
 * cron-job.org menembak, scan penuh tidak akan jalan lebih sering
 * dari ini. Default 0 = tanpa throttle (perilaku lama).
 */
export async function acquireCronLock(
  minIntervalMs = 0
): Promise<CronLockHandle> {

  const runId = createRunId();
  const lockRef = adminDb.collection(LOCK_COLLECTION).doc(LOCK_DOC_ID);

  let reason: "running" | "throttled" | undefined;

  const acquired = await adminDb.runTransaction(async (transaction) => {

    reason = undefined;

    const snapshot = await transaction.get(lockRef);
    const now = Date.now();

    if (snapshot.exists) {
      const data = snapshot.data();
      const lockedAtMs: number =
        data?.lockedAt instanceof Timestamp
          ? data.lockedAt.toMillis()
          : 0;

      const released = data?.released === true;
      const isStale = now - lockedAtMs > LOCK_TTL_MS;

      if (!released && !isStale) {
        reason = "running";
        return false;
      }

      if (minIntervalMs > 0 && now - lockedAtMs < minIntervalMs) {
        reason = "throttled";
        return false;
      }
    }

    transaction.set(lockRef, {
      runId,
      lockedAt: Timestamp.now(),
      released: false,
    });

    return true;

  });

  return {
    acquired,
    reason,
    runId,
    release: async () => {
      if (!acquired) return;

      const snapshot = await lockRef.get();
      if (snapshot.exists && snapshot.data()?.runId === runId) {
        // Tandai selesai, JANGAN hapus: lockedAt dipakai sebagai
        // patokan throttle (minIntervalMs) untuk siklus berikutnya.
        await lockRef.update({ released: true });
      }
    },
  };

}
