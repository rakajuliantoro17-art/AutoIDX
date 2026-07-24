/**
==========================================================
AURA Trade OS
Shared Types
Version : 0.0.1 Alpha
==========================================================
*/

export type Signal =
  | "BUY"
  | "SELL"
  | "HOLD";

export type OrderSide =
  | "BUY"
  | "SELL";

export interface MarketData {

  pair: string;

  price: number;

  emaFast: number;

  emaSlow: number;

  rsi: number;

}

export interface StrategyResult {

  signal: Signal;

  confidence: number;

  reason: string;

}

export interface Position {

  pair: string;

  side: OrderSide;

  entryPrice: number;

  currentPrice: number;

  quantity: number;

  amountIdr: number;

}

export interface Portfolio {

  totalBalance: number;

  availableBalance: number;

  investedBalance: number;

  profit: number;

  loss: number;

}

export interface BotState {

  inPosition: boolean;

  lastSignal: Signal;

  position: Position | null;

}

export interface ExecutionResult {

  success: boolean;

  message: string;

  orderId?: string;

}

export interface MarketTicker {

  pair: string;

  last: number;

  high: number;

  low: number;

  buy: number;

  sell: number;

  volume: number;

}

export interface HealthStatus {

  success: boolean;

  status: string;

  timestamp: string;

}
