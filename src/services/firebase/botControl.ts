/**
==========================================================
AURA Trade OS
Firebase Bot Control State (Admin SDK, server-only)
Version : 0.0.1 Alpha
==========================================================
State kontrol bot yang bisa diubah REAL-TIME dari dashboard
(tanpa perlu redeploy Vercel), beda dari RISK_CONFIG/TRADING_CONFIG
yang berbasis env var (butuh redeploy tiap ganti).

Sumber kebenaran saat runtime: dokumen Firestore ini, BUKAN
env var. Env var (BOT_MODE, BOT_EMERGENCY_STOP) cuma dipakai
sebagai NILAI AWAL saat dokumen ini belum pernah dibuat.

Dua sumber emergency stop (env var DAN dokumen ini) sama-sama
dicek di engine.ts -- yang manapun aktif akan memblokir BUY.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";
import { RISK_CONFIG } from "@/config/risk";
import { TRADING_CONFIG } from "@/config/trading";

export type BotControlMode = "paper" | "live";

export interface BotControl {

  emergencyStop: boolean;

  mode: BotControlMode;

  /**
   * Checklist prioritas pair (opt-in, kosong = perilaku lama tidak
   * berubah). Isinya SELALU subset dari top-N hasil scanner siklus
   * TERBARU (candidatePairs) -- bukan daftar bebas, supaya user
   * cuma bisa memilih dari pair yang memang lagi direkomendasikan
   * scanner saat itu. Kalau field ini non-kosong, HANYA pair yang
   * ada di sini (dan overlap dengan candidatePairs siklus berjalan)
   * + pair yang sedang open position yang diproses TradingEngine
   * tiap siklus -- pair top-N lain yang TIDAK dicentang tetap
   * discan/ditampilkan tapi TIDAK dieksekusi otomatis ("second
   * alternative", cuma observability). Ini sengaja mengurangi
   * jumlah pair yang diproses per siklus untuk mengurangi risiko
   * timeout Vercel, sesuai permintaan pemilik project.
   *
   * Kalau kosong/tidak ada: TIDAK ADA PERUBAHAN dari perilaku lama
   * (union candidatePairs + openPositionPairs + TRADING_CONFIG.pairs
   * tetap semua diproses, lihat services/scheduler/cron.ts).
   */
  priorityPairs?: string[];

  updatedAt: number;

  updatedBy?: string;

}

const CONTROL_COLLECTION = "bot_control";

const CONTROL_DOC_ID = "main";

function defaultControl(): BotControl {

  return {

    emergencyStop: RISK_CONFIG.emergencyStop,

    mode: TRADING_CONFIG.mode,

    updatedAt: Date.now(),

  };

}

/**
 * Ambil status kontrol bot saat ini. Kalau dokumen belum
 * pernah dibuat, otomatis di-seed dari nilai default env var.
 */
export async function getBotControl(): Promise<BotControl> {

  const fallback = defaultControl();

  try {

    const ref =
      adminDb
        .collection(CONTROL_COLLECTION)
        .doc(CONTROL_DOC_ID);

    const snapshot = await ref.get();

    if (!snapshot.exists) {

      await ref.set(fallback);

      return fallback;

    }

    return {

      ...fallback,

      ...(snapshot.data() as BotControl),

    };

  } catch (error) {

    console.error(

      "[BOT CONTROL GET ERROR]",

      error

    );

    // Fail-safe: kalau baca Firestore gagal, JANGAN pernah
    // fallback ke "tidak emergency stop" -- lebih aman anggap
    // emergency stop aktif kalau statusnya tidak bisa dipastikan.
    return {

      ...fallback,

      emergencyStop: true,

    };

  }

}

/**
 * Update status kontrol bot (dipanggil dari API route
 * setelah verifikasi auth berhasil).
 */
export async function updateBotControl(

  update: Partial<Pick<BotControl, "emergencyStop" | "mode" | "priorityPairs">>,

  updatedBy?: string

): Promise<BotControl> {

  const ref =
    adminDb
      .collection(CONTROL_COLLECTION)
      .doc(CONTROL_DOC_ID);

  const next: Partial<BotControl> = {

    ...update,

    updatedAt: Date.now(),

    updatedBy,

  };

  await ref.set(

    next,

    { merge: true }

  );

  return getBotControl();

}
