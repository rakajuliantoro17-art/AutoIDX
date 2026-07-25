/**
==========================================================
AURA Trade OS
Paper Trading Types
Version : 0.0.3 Alpha
==========================================================
*/
export interface PaperPosition {
  pair: string;
  inPosition: boolean;
  entryPrice: number;
  coinAmount: number;
  entryValue: number; // IDR yang terkunci di posisi ini
  entryTime: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  lastExitReason?: "TAKE_PROFIT" | "STOP_LOSS" | "MANUAL";
  lastClosedAt?: number;
  updatedAt: number;
}

export interface PaperPortfolio {
  startingBalance: number;
  availableBalance: number;
  equityIdr: number; // balance + estimasi nilai posisi terbuka
  updatedAt: number;
}

export interface PaperTradeLog {
  pair: string;
  type: "BUY" | "SELL";
  price: number;
  coinAmount: number;
  idrValue: number;
  feeIdr: number;
  pnlIdr?: number;
  pnlPercent?: number;
  reason?: string;
  executedAt: number;
}
