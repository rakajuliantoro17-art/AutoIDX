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
