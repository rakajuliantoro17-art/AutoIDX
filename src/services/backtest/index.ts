/**
==========================================================
AURA Trade OS
Backtest Service Entry Point
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
Core Engine
==========================================================
*/

export {

    default as BacktestEngine

}

from "./engine";


export {

    BacktestEngine

}

from "./engine";



export type {

    BacktestCandle,

    BacktestSignal,

    StrategyOutput,

    StrategyAdapter,

    EngineConfig,

    EngineResult

}

from "./engine";



/**
==========================================================
Execution Simulator
==========================================================
*/

export {

    default as backtestSimulator

}

from "./simulator";


export {

    BacktestSimulator

}

from "./simulator";


export type {

    SimulatorOrder,

    SimulatorResult,

    SimulatorConfig,

    SimulatorSide,

    SimulatorStatus

}

from "./simulator";



/**
==========================================================
Runner
==========================================================
*/

export {

    default as backtestRunner

}

from "./runner";


export {

    BacktestRunner

}

from "./runner";


export type {

    RunnerStatus,

    RunnerProgress,

    RunnerResult,

    BacktestDataset,

    BacktestCandle as RunnerCandle

}

from "./runner";



/**
==========================================================
Metrics Engine
==========================================================
*/

export {

    default as backtestMetrics

}

from "./metrics";


export {

    BacktestMetricsEngine

}

from "./metrics";


export type {

    MetricTrade,

    BacktestMetrics

}

from "./metrics";



/**
==========================================================
Report Generator
==========================================================
*/

export {

    default as backtestReport

}

from "./report";


export {

    BacktestReportGenerator

}

from "./report";


export type {

    BacktestReport,

    BacktestSummary,

    BacktestTrade

}

from "./report";
