/**
==========================================================
AURA Trade OS
Trading Type Definitions
Version : 0.0.6 Alpha
==========================================================
*/

/*
|--------------------------------------------------------------------------
| Signal Types
|--------------------------------------------------------------------------
*/

export type TradeSignal =
  | "BUY"
  | "SELL"
  | "HOLD";

export type TrendType =
  | "BULLISH"
  | "BEARISH"
  | "SIDEWAYS";

export type ExecutionMode =
  | "paper"
  | "live";

/*
|--------------------------------------------------------------------------
| Market Data
|--------------------------------------------------------------------------
*/

export interface MarketSnapshot {

  pair: string;

  price: number;

  rsi: number;

  emaFast: number;

  emaSlow: number;

  volume?: number;

  timestamp: string;

}

/*
|--------------------------------------------------------------------------
| Position
|--------------------------------------------------------------------------
*/

export interface Position {

  pair: string;

  inPosition: boolean;

  buyPrice: number;

  currentPrice?: number;

  coinAmount: number;

  openedAt?: string;

  updatedAt?: string;

}

/*
|--------------------------------------------------------------------------
| Trade
|--------------------------------------------------------------------------
*/

export interface Trade {

  id?: string;

  pair: string;

  side: "BUY" | "SELL";

  price: number;

  amount: number;

  total: number;

  fee?: number;

  reason: string;

  timestamp: string;

}

/*
|--------------------------------------------------------------------------
| Decision
|--------------------------------------------------------------------------
*/

export interface TradingDecision {

  signal: TradeSignal;

  confidence: number;

  reason: string;

}

/*
|--------------------------------------------------------------------------
| Strategy
|--------------------------------------------------------------------------
*/

export interface StrategyResult
  extends TradingDecision {

  trend: TrendType;

  strategy: string;

}

/*
|--------------------------------------------------------------------------
| Risk
|--------------------------------------------------------------------------
*/

export interface RiskEvaluation {

  shouldStopLoss: boolean;

  shouldTakeProfit: boolean;

  profitLossPercent: number;

  action:
    | "STOP_LOSS"
    | "TAKE_PROFIT"
    | "HOLD";

  reason: string;

}

/*
|--------------------------------------------------------------------------
| Portfolio
|--------------------------------------------------------------------------
*/

export interface Portfolio {

  pair: string;

  investedValue: number;

  currentValue: number;

  profitLoss: number;

  profitLossPercent: number;

}

/*
|--------------------------------------------------------------------------
| Execution
|--------------------------------------------------------------------------
*/

export interface ExecutionResult {

  success: boolean;

  orderId: string;

  mode: ExecutionMode;

  executedPrice: number;

  executedAmount: number;

  executedAt: string;

  message: string;

}

/*
|--------------------------------------------------------------------------
| Engine
|--------------------------------------------------------------------------
*/

export interface EngineResult {

  success: boolean;

  signal: TradeSignal;

  confidence: number;

  actionExecuted: boolean;

  reason: string;

  timestamp: string;

}

/*
|--------------------------------------------------------------------------
| Activity Log
|--------------------------------------------------------------------------
*/

export interface ActivityLog {

  id?: string;

  type:
    | "info"
    | "success"
    | "warning"
    | "danger";

  message: string;

  timestamp: string;

}
