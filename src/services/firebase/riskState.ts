/**
==========================================================
AURA Trade OS
Firebase Risk State Manager (Admin SDK, server-only)
Version : 0.0.2 Alpha
==========================================================
Tracking rugi/untung harian (dailyPnlIdr) untuk validasi
RISK_CONFIG.maxDailyLossPercent sebelum BUY baru. Reset
otomatis setiap hari (berdasarkan tanggal UTC).

CATATAN PENTING: file ini sebelumnya pakai Client SDK
("firebase/firestore"), yang di-block Firestore Security
Rules saat dipanggil dari server (request.auth selalu null
di context ini) -- sama persis masalah yang sudah pernah
diperbaiki di paperTradingStore.ts. Query/write gagal diam-
diam, masuk catch, balik ke default dailyPnlIdr: 0 -- artinya
validasi maxDailyLossPercent kelihatan terpasang tapi tidak
pernah benar-benar bekerja. Sudah diperbaiki pakai Admin SDK.
==========================================================
*/

import { adminDb } from "@/services/firebase/admin";

export interface RiskState {

  dateKey: string;

  dailyPnlIdr: number;

  updatedAt: number;

}

const RISK_STATE_COLLECTION = "risk_state";

const RISK_STATE_DOC_ID = "daily";

/**
 * Key tanggal UTC hari ini, format YYYY-MM-DD.
 * Dipakai untuk deteksi pergantian hari -> reset otomatis.
 */
function todayKey(): string {

  return new Date().toISOString().slice(0, 10);

}

function defaultState(): RiskState {

  return {

    dateKey: todayKey(),

    dailyPnlIdr: 0,

    updatedAt: Date.now(),

  };

}

/**
 * Ambil risk state hari ini. Kalau dokumen tersimpan
 * masih tanggal kemarin (atau lebih lama), otomatis
 * dianggap reset ke 0 (tanpa menulis ulang ke Firestore
 * sampai ada trade baru -- biar hemat write).
 */
export async function getRiskState(): Promise<RiskState> {

  const fallback = defaultState();

  try {

    const ref =
      adminDb
        .collection(RISK_STATE_COLLECTION)
        .doc(RISK_STATE_DOC_ID);

    const snapshot = await ref.get();

    if (!snapshot.exists) {

      await ref.set(fallback);

      return fallback;

    }

    const data = snapshot.data() as RiskState;

    if (data.dateKey !== todayKey()) {

      // Hari sudah berganti -- anggap rugi harian reset ke 0.
      return {

        ...fallback,

      };

    }

    return {

      ...fallback,

      ...data,

    };

  } catch (error) {

    console.error(

      "[RISK STATE GET ERROR]",

      error

    );

    return fallback;

  }

}

/**
 * Catat P&L realized (dari SELL / stop-loss / take-profit)
 * ke akumulasi rugi/untung harian. Otomatis reset kalau
 * hari sudah berganti sejak data terakhir tersimpan.
 */
export async function recordRealizedPnl(

  pnlIdr: number

): Promise<boolean> {

  try {

    const current = await getRiskState();

    const ref =
      adminDb
        .collection(RISK_STATE_COLLECTION)
        .doc(RISK_STATE_DOC_ID);

    await ref.set(

      {

        dateKey: todayKey(),

        dailyPnlIdr: current.dailyPnlIdr + pnlIdr,

        updatedAt: Date.now(),

      },

      { merge: true }

    );

    return true;

  } catch (error) {

    console.error(

      "[RISK STATE RECORD PNL ERROR]",

      error

    );

    return false;

  }

}
