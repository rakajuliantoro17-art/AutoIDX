/**
==========================================================
AURA Trade OS
Cron Heartbeat (Admin SDK, server-only)
Version : 0.1.0

Celah yang ditutup: TIDAK ADA satu pun mekanisme yang tahu
kalau trigger eksternal (cron-job.org) yang memanggil
/api/cron/scan BERHENTI menembak. Kalau itu terjadi, bot
"auto live trading" diam-diam berhenti total -- tidak scan
market, tidak jalankan stop-loss/take-profit, tidak
reconcile -- TANPA notifikasi apa pun. Untuk sistem yang
katanya jalan otomatis tanpa pengawasan, ini risiko besar.

(services/liveTrading/monitor/heartbeat.ts yang orphan TIDAK
bisa dipakai untuk ini -- itu in-memory class biasa, sedangkan
Vercel serverless functions stateless: tiap invocation cron
kemungkinan besar instance/container baru, memori tidak
bertahan antar panggilan. Harus Firestore, bukan in-memory.)

Cara kerja:
1. scan.ts memanggil recordHeartbeat() di akhir tiap siklus
   yang SUKSES (best-effort, tidak pernah menggagalkan cron).
2. Siapa pun (dashboard, endpoint health, atau cron
   reconcile.ts yang terjadwal terpisah) bisa panggil
   getCronHeartbeatStatus() untuk tahu "kapan terakhir kali
   scan.ts benar-benar selesai jalan".
3. reconcile.ts memakai ini untuk mengirim notifikasi
   (Telegram/dll via automationNotifier) kalau scan.ts
   ternyata sudah lama tidak jalan -- silang-awasi 2 cron
   supaya kalau salah satu berhenti, yang lain masih bisa
   membunyikan alarm.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

const COLLECTION = "system_status";
const DOC_ID = "cronHeartbeat";

/**
 * Interval siklus scan.ts yang diharapkan (dipicu cron-job.org)
 * -- dipakai sebagai basis ambang ALIVE/STALE/DEAD. Sesuai
 * dokumentasi di scan.ts & cronLock.ts (trigger tiap ~30 detik).
 */
const EXPECTED_INTERVAL_MS = 30_000;

export type CronHeartbeatStatus = "ALIVE" | "STALE" | "DEAD";

export interface CronHeartbeatState {
  status: CronHeartbeatStatus;
  lastRunAt: number | null;
  ageMs: number | null;
  lastDurationMs: number | null;
  lastQualifiedCount: number | null;
}

/**
 * Dipanggil dari cron/scan.ts di akhir tiap siklus SUKSES.
 * Best-effort dengan sengaja -- kegagalan menulis heartbeat
 * TIDAK PERNAH menggagalkan cron scan itu sendiri.
 */
export async function recordHeartbeat(meta: {
  durationMs: number;
  qualifiedCount: number;
}): Promise<void> {

  try {

    await adminDb.collection(COLLECTION).doc(DOC_ID).set({
      lastRunAt: Date.now(),
      lastDurationMs: meta.durationMs,
      lastQualifiedCount: meta.qualifiedCount,
    });

  } catch (error) {

    console.error("[CronHeartbeat] Gagal menyimpan heartbeat:", error);

  }

}

/**
 * ALIVE   : siklus terakhir dalam 3x interval yang diharapkan.
 * STALE   : lewat 3x tapi belum sampai 10x -- kemungkinan
 *           trigger eksternal lambat/gangguan sementara.
 * DEAD    : lewat 10x interval (~5 menit) -- kemungkinan besar
 *           trigger eksternal berhenti total, atau cron error
 *           terus-menerus sebelum sempat mencatat heartbeat.
 */
export async function getCronHeartbeatStatus(): Promise<CronHeartbeatState> {

  try {

    const snap = await adminDb.collection(COLLECTION).doc(DOC_ID).get();

    if (!snap.exists) {

      return {
        status: "DEAD",
        lastRunAt: null,
        ageMs: null,
        lastDurationMs: null,
        lastQualifiedCount: null,
      };

    }

    const data = snap.data() as {
      lastRunAt: number;
      lastDurationMs: number;
      lastQualifiedCount: number;
    };

    const ageMs = Date.now() - data.lastRunAt;

    const status: CronHeartbeatStatus =
      ageMs <= EXPECTED_INTERVAL_MS * 3
        ? "ALIVE"
        : ageMs <= EXPECTED_INTERVAL_MS * 10
        ? "STALE"
        : "DEAD";

    return {
      status,
      lastRunAt: data.lastRunAt,
      ageMs,
      lastDurationMs: data.lastDurationMs ?? null,
      lastQualifiedCount: data.lastQualifiedCount ?? null,
    };

  } catch (error) {

    console.error("[CronHeartbeat] Gagal membaca heartbeat:", error);

    // Fail-closed dari sudut pandang MONITORING (bukan trading):
    // kalau gagal baca statusnya sendiri, anggap DEAD supaya
    // operator diberi tahu ada sesuatu yang tidak beres, bukan
    // diam-diam dianggap sehat.
    return {
      status: "DEAD",
      lastRunAt: null,
      ageMs: null,
      lastDurationMs: null,
      lastQualifiedCount: null,
    };

  }

}
