export const BOT_CONFIG = {
  defaultTradeAmount: Number(process.env.BOT_DEFAULT_TRADE_AMOUNT ?? 10000),
  maxTradeAmount: Number(process.env.BOT_MAX_TRADE_AMOUNT ?? 25000),
  targetProfit: Number(process.env.BOT_TARGET_PROFIT ?? 3),
  stopLoss: Number(process.env.BOT_STOP_LOSS ?? 1),
  interval: Number(process.env.BOT_INTERVAL ?? 300),
  mode: process.env.BOT_MODE ?? "paper",
};
