/**
==========================================================
AURA Trade OS
Canary Metrics Store (Admin SDK, server-only)
Version : 0.1.0 Alpha

CanaryMetrics (canaryMetrics.ts) SEBELUMNYA orphan total (0
importer) - class-nya sendiri sudah bagus (menghitung error
rate, latency, drawdown, win rate, lalu menentukan status
HEALTHY/WARNING/CRITICAL) tapi in-memory saja, jadi state-nya
hilang tiap kali serverless function baru dijalankan Vercel.

File ini persist order canary ke Firestore (pola sama dengan
riskState.ts/modelStore.ts - Admin SDK, server-only), supaya
canary benar-benar bisa dipakai memantau live trading skala
kecil lintas banyak siklus cron, bukan cuma 1 invocation.

TIDAK menyimpan array bersarang (lihat pelajaran dari
modelStore.ts) - "orders" adalah array of flat object, aman
untuk Firestore.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { CanaryMetrics, CanaryOrderMetric, CanaryMetricsSnapshot } from "./canaryMetrics";

const COLLECTION = "canary_metrics";
const DOC_ID = "live";

// Konsisten dengan CanaryMetricsConfig.maxSamples default (500) di
// canaryMetrics.ts - dibatasi supaya dokumen Firestore tidak
// membengkak tanpa batas.
const MAX_STORED_ORDERS = 500;

interface CanaryDoc {
  orders: CanaryOrderMetric[];
  peakEquity: number;
  currentEquity: number;
  totalPnl: number;
  updatedAt: number;
}

function docRef() {
  return adminDb.collection(COLLECTION).doc(DOC_ID);
}

/**
 * Catat satu order canary (BUY/SELL live, sukses atau gagal) ke
 * Firestore. BEST-EFFORT - dipanggil dengan try/catch di sisi
 * pemanggil (trading/live.ts) supaya kegagalan mencatat metrik
 * TIDAK PERNAH menggagalkan/membatalkan trade asli yang sudah
 * terjadi.
 */
export async function recordCanaryOrder(metric: CanaryOrderMetric): Promise<void> {
  const snapshot = await docRef().get();

  const existing: CanaryDoc = snapshot.exists
    ? (snapshot.data() as CanaryDoc)
    : { orders: [], peakEquity: 0, currentEquity: 0, totalPnl: 0, updatedAt: 0 };

  const orders = [...existing.orders, metric].slice(-MAX_STORED_ORDERS);

  let { peakEquity, currentEquity, totalPnl } = existing;

  if (metric.pnl !== undefined && Number.isFinite(metric.pnl)) {
    totalPnl += metric.pnl;
    currentEquity += metric.pnl;
    peakEquity = Math.max(peakEquity, currentEquity);
  }

  await docRef().set(
    {
      orders,
      peakEquity,
      currentEquity,
      totalPnl,
      updatedAt: Date.now(),
      serverUpdatedAt: FieldValue.serverTimestamp(),
    },
    { merge: false }
  );
}

/**
 * Ambil snapshot canary TERKINI (dihitung dari seluruh order
 * tersimpan) - dipakai untuk (a) keputusan auto-halt sebelum BUY
 * live baru, dan (b) endpoint status untuk dashboard.
 */
export async function getCanarySnapshot(
  configOverride?: ConstructorParameters<typeof CanaryMetrics>[0]
): Promise<CanaryMetricsSnapshot> {
  const snapshot = await docRef().get();

  const metrics = new CanaryMetrics(configOverride);

  if (!snapshot.exists) {
    return metrics.getSnapshot();
  }

  const data = snapshot.data() as CanaryDoc;

  for (const order of data.orders) {
    try {
      metrics.recordOrder(order);
    } catch (error) {
      // Defense in depth: CanaryMetrics.recordOrder() melempar error
      // untuk data tidak valid (mis. amount<=0). Satu record rusak
      // TIDAK BOLEH bikin seluruh snapshot gagal dihitung - lewati
      // saja record itu, catat ke console untuk investigasi.
      console.error("[CanaryStore] Melewati order canary tidak valid:", error);
    }
  }

  return metrics.getSnapshot();
}

/**
 * Reset canary (dipakai kalau mau mulai ulang periode uji coba
 * live trading skala kecil dari nol - mis. setelah ganti
 * strategi/parameter).
 */
export async function resetCanary(): Promise<void> {
  await docRef().set({
    orders: [],
    peakEquity: 0,
    currentEquity: 0,
    totalPnl: 0,
    updatedAt: Date.now(),
    serverUpdatedAt: FieldValue.serverTimestamp(),
  });
}

export default { recordCanaryOrder, getCanarySnapshot, resetCanary };
