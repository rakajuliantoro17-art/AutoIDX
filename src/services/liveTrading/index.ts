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
