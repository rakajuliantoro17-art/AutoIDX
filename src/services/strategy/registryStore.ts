/**
==========================================================
AURA Trade OS
Strategy Registry Store (Admin SDK, server-only)
Version : 0.1.0 Alpha

services/strategy/registry.ts (class StrategyRegistry) sebelumnya
orphan total - in-memory (Map biasa), percuma di serverless
Vercel (state hilang tiap invocation baru, jadi enable()/disable()
yang dipanggil dari satu request tidak pernah kelihatan di
request/cron cycle berikutnya).

File ini source-of-truth PERSISTEN (Firestore) untuk status
enable/disable per strategi. registry.ts tetap jadi in-memory
CACHE yang direkonsiliasi dari sini sekali per siklus cron (lihat
scheduler/cron.ts) - bukan setiap kali dibaca, supaya tidak nambah
biaya baca Firestore di setiap evaluasi pair.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

const COLLECTION = "strategy_registry";
const DOC_ID = "status";

export type StrategyStatusValue = "ACTIVE" | "DISABLED";

export interface StrategyStatusMap {
  [strategyName: string]: StrategyStatusValue;
}

/**
 * Ambil status ACTIVE/DISABLED semua strategi yang PERNAH di-set
 * lewat toggle. Strategi yang tidak pernah disebut di sini
 * dianggap ACTIVE (default aman - operator harus eksplisit
 * menonaktifkan, bukan sebaliknya).
 */
export async function getStrategyStatusMap(): Promise<StrategyStatusMap> {
  try {
    const snapshot = await adminDb.collection(COLLECTION).doc(DOC_ID).get();

    if (!snapshot.exists) {
      return {};
    }

    return (snapshot.data() as StrategyStatusMap) ?? {};
  } catch (error) {
    // Fail-open ke default (semua ACTIVE) - kegagalan baca Firestore
    // TIDAK BOLEH menghentikan trading sama sekali. Konsisten dengan
    // rateLimitStore.ts (fail-open untuk fitur defense-in-depth,
    // bukan kontrol utama).
    console.error("[StrategyRegistryStore] Gagal baca status, fail-open ke semua ACTIVE:", error);
    return {};
  }
}

export async function setStrategyStatus(
  strategyName: string,
  status: StrategyStatusValue
): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(DOC_ID)
    .set({ [strategyName]: status }, { merge: true });
}

export default { getStrategyStatusMap, setStrategyStatus };
