/**
==========================================================
AURA Trade OS
Trading Configuration
Version : 0.0.1 Alpha
==========================================================
*/
export type TradingMode = "paper" | "live";

export const TRADING_CONFIG = {
  pair: process.env.BOT_PAIR ?? "btc_idr",

  defaultTradeAmount: Number(process.env.BOT_DEFAULT_TRADE_AMOUNT ?? 10000),

  maxTradeAmount: Number(process.env.BOT_MAX_TRADE_AMOUNT ?? 25000),

  interval: Number(process.env.BOT_INTERVAL ?? 300),

  mode: (process.env.BOT_MODE as TradingMode) ?? "paper",

  order: {
    type: process.env.ORDER_TYPE ?? "limit",
    minimumAmount: Number(process.env.MIN_ORDER_AMOUNT ?? 10000),
  },

  feePercent: Number(process.env.EXCHANGE_FEE ?? 0.3),
} as const;
