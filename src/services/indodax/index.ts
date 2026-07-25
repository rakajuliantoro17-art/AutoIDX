/**
==========================================================
AURA Trade OS
Indodax Service Index
Version : 0.0.5 Alpha
==========================================================
*/

export * from "./client";
export * from "./ticker";
export * from "./market";
export * from "./candles";
export * from "./orderbook";
export * from "./trades";
export * from "./parser";

// Default exports
export { default as indodaxClient } from "./client";
export { default as indodaxTickerService } from "./ticker";
export { default as indodaxMarketService } from "./market";
export { default as indodaxOrderbookService } from "./orderbook";
export { default as indodaxTradesService } from "./trades";
export { default as indodaxCandlesService } from "./candles";
