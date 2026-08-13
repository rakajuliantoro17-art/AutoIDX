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

export interface CronLockHandle {
  readonly acquired: boolean;
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

export async function acquireCronLock(): Promise<CronLockHandle> {

  const runId = createRunId();
  const lockRef = adminDb.collection(LOCK_COLLECTION).doc(LOCK_DOC_ID);

  const acquired = await adminDb.runTransaction(async (transaction) => {

    const snapshot = await transaction.get(lockRef);
    const now = Date.now();

    if (snapshot.exists) {
      const data = snapshot.data();
      const lockedAtMs: number =
        data?.lockedAt instanceof Timestamp
          ? data.lockedAt.toMillis()
          : 0;

      const isStale = now - lockedAtMs > LOCK_TTL_MS;

      if (!isStale) {
        return false;
      }
    }

    transaction.set(lockRef, {
      runId,
      lockedAt: Timestamp.now(),
    });

    return true;

  });

  return {
    acquired,
    runId,
    release: async () => {
      if (!acquired) return;

      const snapshot = await lockRef.get();
      if (snapshot.exists && snapshot.data()?.runId === runId) {
        await lockRef.delete();
      }
    },
  };

}
