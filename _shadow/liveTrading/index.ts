/**
==========================================================
AURA Trade OS
Live Trading Service
Version : 0.1.0 Alpha
==========================================================
Public Live Trading Exports
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
Trading Engine
==========================================================
*/

export {

    default as liveTradingEngine

}

from "./engine";





/*
==========================================================
Exchange Layer
==========================================================
*/

export {

    default as indodaxClient

}

from "./exchange/indodaxClient";



export {

    default as accountService

}

from "./exchange/account";



export {

    default as marketService

}

from "./exchange/market";



export {

    default as orderExecutor

}

from "./exchange/orderExecutor";







/*
==========================================================
Execution Layer
==========================================================
*/

export {

    default as orderManager

}

from "./execution/orderManager";



export {

    default as orderTracker

}

from "./execution/orderTracker";



export {

    default as fillHandler

}

from "./execution/fillHandler";







/*
==========================================================
Risk Layer
==========================================================
*/

export {

    default as riskManager

}

from "./risk/riskManager";



export {

    default as exposureManager

}

from "./risk/exposure";



export {

    default as positionLimit

}

from "./risk/positionLimit";







/*
==========================================================
Monitoring Layer
==========================================================
*/

export {

    default as healthMonitor

}

from "./monitor/health";



export {

    default as heartbeat

}

from "./monitor/heartbeat";

export * from "./engine/liveTradingConfig";
export * from "./engine/liveTradingContext";
export * from "./engine/liveTradingResult";
export * from "./engine/liveTradingRunner";
export * from "./engine/liveTradingEngine";

export * from "./gate/liveApproval";
export * from "./gate/killSwitch";
export * from "./gate/liveTradingGuard";
export * from "./gate/liveOrderGate";

export * from "./exchange/exchangeClient";
export * from "./exchange/exchangeOrder";
export type { ExchangeResponse as ExchangeApiResponse } from "./exchange/exchangeResponse";
export * from "./exchange/indodaxAdapter";

export * from "./execution/orderIdempotency";
export * from "./execution/executionReconciler";
export * from "./execution/liveOrderExecutor";

export * from "./monitoring/liveExecutionMetrics";
export * from "./monitoring/liveTradeLog";
export * from "./monitoring/liveHealth";

export * from "./canary";

export * from "./execution";

export * from "./reconciliation";

export * from "./persistence";

export * from "./audit";



export * from "./gate/idempotencyKey";
export * from "./gate/idempotencyStore";
export * from "./gate/duplicateOrderGuard";
export * from "./gate/uncertainExecutionGuard";

export * from "./execution/executionSimulation";
export * from "./execution/executionPreflight";
export * from "./execution/executionTestReport";
export * from "./execution/dryRunController";

export * from "./monitor/productionReadiness";
export * from "./monitor/productionGate";

// canaryConfig sudah di-export lewat "./canary" di atas -- tidak diulang di sini.
export * from "./canary/canaryResult";
export * from "./canary/canaryGuard";
export * from "./canary/canaryExecutor";

export * from "./execution/executionSupervisor";
export * from "./execution/reconciliationService";
export * from "./execution/autoTradingController";
