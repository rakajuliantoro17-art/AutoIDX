/**
==========================================================
AURA Trade OS
Portfolio Performance Module Entry
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
Drawdown
==========================================================
*/

export {

    default as drawdownCalculator

}

from "./drawdown";



export {

    DrawdownCalculator

}

from "./drawdown";



export type {

    DrawdownPoint,

    DrawdownResult,

}

from "./drawdown";



/**
==========================================================
Equity Curve
==========================================================
*/

export {

    default as equityCurve

}

from "./equityCurve";



export {

    EquityCurve

}

from "./equityCurve";



export type {

    EquityPoint,

    EquitySummary,

}

from "./equityCurve";



/**
==========================================================
Metrics
==========================================================
*/

export {

    default as performanceMetrics

}

from "./metrics";



export {

    PerformanceMetricsCalculator

}

from "./metrics";



export type {

    TradeResult,

    PerformanceMetrics,

}

from "./metrics";
