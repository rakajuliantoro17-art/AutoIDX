/**
==========================================================
AURA Trade OS
Firebase Bot State Manager
Version : 0.0.3 Alpha
(Ditambahkan: lastTradeAt untuk cooldown, getOpenPositionsCount
untuk validasi maxOpenPosition lintas-pair)
==========================================================
*/
import { adminDb } from "./admin";
import { FieldValue } from "firebase-admin/firestore";

export interface BotState {
  pair: string;
  status: "IDLE" | "BUY" | "SELL";
  inPosition: boolean;
  entryPrice: number;
  currentPrice: number;
  coinAmount: number;
  positionValue: number;
  profitPercent: number;
  stopLoss: number;
  takeProfit: number;
  lastSignal: "BUY" | "SELL" | "HOLD";
  lastOrderId?: string;
  /**
   * Timestamp (epoch ms) trade terakhir -- dipakai
   * untuk validasi cooldown (RISK_CONFIG.cooldownSeconds).
   */
  lastTradeAt?: number;
  updatedAt: any;
}

const STATE_COLLECTION = "bot_state";

function defaultState(pair: string): BotState {
  return {
    pair,
    status: "IDLE",
    inPosition: false,
    entryPrice: 0,
    currentPrice: 0,
    coinAmount: 0,
    positionValue: 0,
    profitPercent: 0,
    stopLoss: 1,
    takeProfit: 3,
    lastSignal: "HOLD",
    updatedAt: new Date()
  };
}

export async function getBotState(
  pair = "btc_idr"
): Promise<BotState> {
  const fallback = defaultState(pair);
  try {
    const ref = adminDb.collection(STATE_COLLECTION).doc(pair);
    const snapshot = await ref.get();
    if (snapshot.exists) {
      return { ...fallback, ...snapshot.data() } as BotState;
    }
    await ref.set(fallback);
    return fallback;
  }
  catch (error) {
    console.error("[BOT STATE GET ERROR]", error);
    return fallback;
  }
}

export async function updateBotState(
  state: Partial<BotState> & { pair: string }
): Promise<boolean> {
  if (!state.pair) {
    return false;
  }
  try {
    const ref = adminDb.collection(STATE_COLLECTION).doc(state.pair);
    await ref.set(
      {
        ...state,
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );
    return true;
  }
  catch (error) {
    console.error("[BOT STATE UPDATE ERROR]", error);
    return false;
  }
}

/**
 * Menghitung jumlah posisi terbuka di SEMUA pair
 * (lintas-pair), dipakai untuk validasi
 * RISK_CONFIG.maxOpenPosition.
 */
export async function getOpenPositionsCount(): Promise<number> {
  try {
    const snapshot =
      await adminDb
        .collection(STATE_COLLECTION)
        .where("inPosition", "==", true)
        .get();
    return snapshot.size;
  }
  catch (error) {
    console.error("[BOT STATE COUNT ERROR]", error);
    // Fail-safe: anggap posisi penuh supaya tidak
    // membuka posisi baru kalau query gagal.
    return Number.MAX_SAFE_INTEGER;
  }
}
