/**
==========================================================
AURA Trade OS
Paper Trading Firestore Store (Admin SDK, server-only)
Version : 0.0.3 Alpha
==========================================================
*/
import { adminDb } from "@/services/firebase/admin";
import { PaperPosition, PaperPortfolio, PaperTradeLog } from "@/services/paperTrading/types";

const POSITIONS_COLLECTION = "paper_positions";
const PORTFOLIO_DOC_PATH = "paper_portfolio/default";
const TRADE_LOG_COLLECTION = "paper_trade_logs";

function defaultPosition(pair: string): PaperPosition {
  return {
    pair,
    inPosition: false,
    entryPrice: 0,
    coinAmount: 0,
    entryValue: 0,
    entryTime: 0,
    stopLossPrice: 0,
    takeProfitPrice: 0,
    updatedAt: Date.now(),
  };
}

export async function getPaperPosition(pair: string): Promise<PaperPosition> {
  const ref = adminDb.collection(POSITIONS_COLLECTION).doc(pair);
  const snap = await ref.get();
  if (snap.exists) {
    return { ...defaultPosition(pair), ...(snap.data() as PaperPosition) };
  }
  const fallback = defaultPosition(pair);
  await ref.set(fallback);
  return fallback;
}

/** Sumber kebenaran untuk exit-check: semua posisi yang BENAR-BENAR sedang terbuka */
export async function getOpenPaperPositions(): Promise<PaperPosition[]> {
  const snap = await adminDb.collection(POSITIONS_COLLECTION).where("inPosition", "==", true).get();
  return snap.docs.map((d) => d.data() as PaperPosition);
}

export async function savePaperPosition(position: PaperPosition) {
  const ref = adminDb.collection(POSITIONS_COLLECTION).doc(position.pair);
  await ref.set({ ...position, updatedAt: Date.now() }, { merge: true });
}

export async function getPaperPortfolio(startingBalance: number): Promise<PaperPortfolio> {
  const ref = adminDb.doc(PORTFOLIO_DOC_PATH);
  const snap = await ref.get();
  if (snap.exists) {
    return snap.data() as PaperPortfolio;
  }
  const fallback: PaperPortfolio = {
    startingBalance,
    availableBalance: startingBalance,
    equityIdr: startingBalance,
    updatedAt: Date.now(),
  };
  await ref.set(fallback);
  return fallback;
}

export async function savePaperPortfolio(portfolio: PaperPortfolio) {
  const ref = adminDb.doc(PORTFOLIO_DOC_PATH);
  await ref.set({ ...portfolio, updatedAt: Date.now() }, { merge: true });
}

export async function logPaperTrade(log: PaperTradeLog) {
  await adminDb.collection(TRADE_LOG_COLLECTION).add(log);
}
