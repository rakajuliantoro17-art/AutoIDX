/**
==========================================================
AutoIDX
Bot Constants
Version : 0.0.1 Alpha
==========================================================
*/
export const BOT = {
  NAME: "AutoIDX",
  VERSION: "0.0.1",
  DESCRIPTION: "Automated Indodax Trading Engine",
} as const;

export const API = {
  PUBLIC_BASE_URL: "https://indodax.com/api",
  PRIVATE_BASE_URL: "https://indodax.com/tapi",
  REQUEST_TIMEOUT: 10_000,
  MAX_RETRY: 3,
} as const;

export const TRADING = {
  DEFAULT_PAIR: "btcidr",
  DEFAULT_INTERVAL_SECONDS: 300, // 5 minutes
  MIN_TRADE_AMOUNT: 10_000,
  MAX_TRADE_AMOUNT: 25_000,
  MAX_PRICE_HISTORY: 500,
} as const;

export const INDICATORS = {
  EMA_FAST: 9,
  EMA_SLOW: 21,
  RSI_PERIOD: 14,
  RSI_OVERSOLD: 30,
  RSI_OVERBOUGHT: 70,
} as const;

export const STRATEGY = {
  RSI_BUY: INDICATORS.RSI_OVERSOLD,
  RSI_SELL: INDICATORS.RSI_OVERBOUGHT,
} as const;

export const RISK = {
  DEFAULT_STOP_LOSS_PERCENT: 2,
  DEFAULT_TARGET_PROFIT_PERCENT: 3,
  MAX_DAILY_LOSS_PERCENT: 5,
  MAX_OPEN_POSITIONS: 3,
} as const;

export const BOT_MODE = {
  PAPER: "paper",
  LIVE: "live",
} as const;

export const SIGNAL = {
  BUY: "BUY",
  SELL: "SELL",
  HOLD: "HOLD",
} as const;

export const ORDER = {
  BUY: "buy",
  SELL: "sell",
} as const;

export const STATUS = {
  IDLE: "idle",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
} as const;

export const FIRESTORE = {
  BOT_STATE: "bot_state",
  ACTIVITY_LOGS: "activity_logs",
  ORDERS: "orders",
  PORTFOLIO: "portfolio",
} as const;

export const LOG_LEVEL = {
  INFO: "INFO",
  WARNING: "WARNING",
  ERROR: "ERROR",
  SUCCESS: "SUCCESS",
} as const;
