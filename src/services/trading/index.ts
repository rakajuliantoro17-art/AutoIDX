/**
==========================================================
AURA Trade OS
Trading Service
Version : 0.0.6 Alpha
==========================================================
*/

/*
|--------------------------------------------------------------------------
| Core Engine
|--------------------------------------------------------------------------
*/

export { default as TradingEngine } from "./engine";
export { default as DecisionEngine } from "./decision";
export { default as TradeExecutor } from "./executor";

/*
|--------------------------------------------------------------------------
| Trading Services
|--------------------------------------------------------------------------
*/

export { default as PaperTradingService } from "./paper";
export { default as PortfolioService } from "./portfolio";
export { default as PositionService } from "./position";
export { default as TradingHistory } from "./history";
export { default as RiskManager } from "./risk";
export { default as TradingStrategy } from "./strategy";

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export * from "./types";
export * from "./decision";
export * from "./executor";
