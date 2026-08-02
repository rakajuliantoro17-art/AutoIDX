/**
==========================================================
AURA Trade OS
Firebase Risk State Manager
Version : 0.0.1 Alpha
==========================================================
Tracking rugi/untung harian (dailyPnlIdr) untuk validasi
RISK_CONFIG.maxDailyLossPercent sebelum BUY baru. Reset
otomatis setiap hari (berdasarkan tanggal UTC).
==========================================================
*/

import {

doc,

getDoc,

setDoc,

serverTimestamp

}

from "firebase/firestore";

import {

db

}

from "./config";

export interface RiskState {

  dateKey: string;

  dailyPnlIdr: number;

  updatedAt: any;

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

    updatedAt: new Date(),

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

    const ref = doc(db, RISK_STATE_COLLECTION, RISK_STATE_DOC_ID);

    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {

      await setDoc(ref, fallback);

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

    const ref = doc(db, RISK_STATE_COLLECTION, RISK_STATE_DOC_ID);

    await setDoc(

      ref,

      {

        dateKey: todayKey(),

        dailyPnlIdr: current.dailyPnlIdr + pnlIdr,

        updatedAt: serverTimestamp(),

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
