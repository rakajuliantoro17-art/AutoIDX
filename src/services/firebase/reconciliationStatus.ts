/**
==========================================================
AURA Trade OS
Reconciliation Status (Admin SDK, server-only)
Version : 0.1.0

Menutup celah `requireReconciliation` di
services/liveTrading/risk/liveTradingConfig.ts yang sebelumnya
"disimpan untuk kelengkapan config tapi TIDAK PERNAH ditegakkan
oleh kode manapun".

cron/reconcile.ts menulis status TERAKHIR ke sini setiap kali
selesai jalan (baik konsisten maupun mismatch). trading/live.ts
membaca status ini SEBELUM live BUY -- kalau requireReconciliation
aktif (default true) dan status tidak ada / basi / mismatch,
BUY diblokir. Fail-closed: sengaja diblokir kalau statusnya
TIDAK JELAS (mis. reconcile.ts belum pernah jalan), bukan
diam-diam diloloskan.

CATATAN: hanya relevan untuk pengecekan SEBELUM live BUY.
SELL/exit TIDAK PERNAH diblokir oleh ini (konsisten dengan
prinsip Emergency Stop yang sama di seluruh sistem).
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

const COLLECTION = "system_status";
const DOC_ID = "reconciliation";

export interface ReconciliationStatus {
  consistent: boolean;
  checkedAt: number;
  positionsChecked: number;
  mismatchCount: number;
}

/**
 * Dipanggil dari cron/reconcile.ts setiap selesai satu siklus
 * pengecekan (baik hasilnya konsisten maupun mismatch).
 */
export async function recordReconciliationStatus(
  status: Omit<ReconciliationStatus, "checkedAt">
): Promise<void> {

  try {

    await adminDb
      .collection(COLLECTION)
      .doc(DOC_ID)
      .set(
        {
          ...status,
          checkedAt: Date.now(),
        },
        { merge: true }
      );

  } catch (error) {

    // Non-fatal dengan sengaja -- kegagalan MENULIS status tidak
    // boleh menggagalkan reconcile.ts itu sendiri (emergency stop
    // di atasnya, kalau ada mismatch, sudah lebih dulu dieksekusi).
    // Sisi baca (getReconciliationStatus) tetap fail-closed kalau
    // dokumen ini somehow tidak update -- BUY berikutnya akan
    // dianggap "basi" dan diblokir, bukan diam-diam diloloskan.
    console.error("[ReconciliationStatus] Gagal menyimpan status:", error);

  }

}

/**
 * Dibaca dari trading/live.ts SEBELUM live BUY. null berarti
 * belum pernah ada reconciliation yang tercatat sama sekali
 * (mis. cron/reconcile.ts belum pernah jalan) -- caller WAJIB
 * memperlakukan ini sebagai "tidak aman", bukan "aman karena
 * belum ada masalah yang terdeteksi".
 */
export async function getReconciliationStatus(): Promise<ReconciliationStatus | null> {

  try {

    const snap = await adminDb.collection(COLLECTION).doc(DOC_ID).get();

    if (!snap.exists) return null;

    return snap.data() as ReconciliationStatus;

  } catch (error) {

    // Fail-closed: kalau Firestore sendiri error saat membaca,
    // caller HARUS memperlakukan ini sama seperti "belum pernah
    // ada reconciliation" (null) -- BUY diblokir, bukan diam-diam
    // diloloskan gara-gara gagal baca status keamanan.
    console.error("[ReconciliationStatus] Gagal membaca status:", error);
    return null;

  }

}
