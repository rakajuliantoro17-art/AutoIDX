/**
==========================================================
AURA Trade OS
Backtest Service
Version : 0.1.0 Alpha
==========================================================
Public Backtest Module Exports
==========================================================
*/





/*
==========================================================
Core Types
==========================================================
*/


export * from "./types";







/*
==========================================================
Main Engine
==========================================================
*/


export {

    default as backtestEngine,

    BacktestEngine

}

from "./engine";







/*
==========================================================
Execution Runner
==========================================================
*/


export {

    default as backtestRunner,

    BacktestRunner

}

from "./runner";







/*
==========================================================
Simulation
==========================================================
*/


export {

    default as BacktestSimulator

}

from "./simulator";







/*
==========================================================
Metrics
==========================================================
*/


export {

    default as metricsEngine,

    BacktestMetricsEngine

}

from "./metrics";







/*
==========================================================
Report
==========================================================
*/


export {

    default as backtestReport,

    BacktestReportGenerator

}

from "./report";







/*
==========================================================
Order Execution
==========================================================
*/


export {

    default as orderSimulator,

    OrderSimulator

}

from "./execution/orderSimulator";





export {

    default as fillSimulator,

    FillSimulator

}

from "./execution/fillSimulator";







/*
==========================================================
Portfolio
==========================================================
*/


export {

    default as VirtualPortfolio

}

from "./portfolio/virtualPortfolio";





export {

    default as positionManager,

    PositionManager

}

from "./portfolio/position";


export {
    createHistoricalCandle,
    validateCandle,
} from "./market/historicalCandle";

export type {
    HistoricalCandle,
} from "./market/historicalCandle";

export {
    createHistoricalDataset,
} from "./market/historicalDataset";

export type {
    HistoricalDataset,
} from "./market/historicalDataset";

export {
    MarketReplay,
} from "./market/marketReplay";

export type {
    MarketReplayState,
} from "./market/marketReplay";

export {
    PriceResolver,
    priceResolver,
} from "./market/priceResolver";

export type {
    PriceReference,
} from "./market/priceResolver";

/*
 * Execution
 */

export {
    PercentageSlippageModel,
    NoSlippageModel,
} from "./execution/slippageModel";

export type {
    SlippageModel,
    SlippageSide,
} from "./execution/slippageModel";

export {
    createSimulatedOrder,
} from "./execution/simulatedOrder";

export type {
    SimulatedOrder,
    SimulatedOrderSide,
    SimulatedOrderType,
    SimulatedOrderStatus,
} from "./execution/simulatedOrder";

export {
    createSimulatedFill,
} from "./execution/simulatedFill";

export type {
    SimulatedFill,
} from "./execution/simulatedFill";

export {
    ExecutionSimulator,
} from "./execution/executionSimulator";

export type {
    ExecutionSimulatorConfig,
} from "./execution/executionSimulator";

/*
 * Portfolio
 */

export {
    createPosition,
    calculateUnrealizedPnl,
} from "./portfolio/simulatedPosition";

export type {
    SimulatedPosition,
    PositionSide,
} from "./portfolio/simulatedPosition";

export {
    createPortfolioSnapshot,
} from "./portfolio/portfolioSnapshot";

export type {
    PortfolioSnapshot,
} from "./portfolio/portfolioSnapshot";

export {
    SimulatedPortfolio,
} from "./portfolio/simulatedPortfolio";

/*
 * Metrics
 */

export {
    analyzeDrawdown,
} from "./metrics/drawdownAnalyzer";

export type {
    DrawdownPoint,
    DrawdownResult,
} from "./metrics/drawdownAnalyzer";

export {
    calculateTradeStatistics,
} from "./metrics/tradeStatistics";

export type {
    CompletedTrade,
    TradeStatistics,
} from "./metrics/tradeStatistics";

export {
    calculatePerformanceMetrics,
} from "./metrics/performanceMetrics";

export type {
    PerformanceMetrics,
} from "./metrics/performanceMetrics";

/*
 * Engine
 */

export {
    BacktestClock,
} from "./engine/backtestClock";

export {
    createBacktestConfig,
} from "./engine/backtestConfig";

export type {
    BacktestConfig,
} from "./engine/backtestConfig";

export type {
    BacktestContext,
    StrategyLike,
    StrategyInput,
    StrategySignal,
} from "./engine/backtestContext";

export type {
    BacktestResult,
} from "./engine/backtestResult";

export {
    BacktestRunner,
} from "./engine/backtestRunner";

/*
 * Main engine facade
 */

export {
    BacktestEngine,
} from "./engine/backtestEngine";
