/**
==========================================================
AURA Trade OS
Trading Configuration
Version : 0.0.1 Alpha
==========================================================
*/

export const TRADING_CONFIG = {
  pair: "btcidr",

  defaultTradeAmount: Number(process.env.BOT_DEFAULT_TRADE_AMOUNT ?? 10000),

  maxTradeAmount: Number(process.env.BOT_MAX_TRADE_AMOUNT ?? 25000),

  interval: Number(process.env.BOT_INTERVAL ?? 300),

  mode: process.env.BOT_MODE ?? "paper",
} as const;
