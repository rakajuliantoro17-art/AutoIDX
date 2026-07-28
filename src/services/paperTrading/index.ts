/**
==========================================================
AURA Trade OS
Paper Trading Service Entry Point
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
Types
==========================================================
*/

export type {

    TradeSide,

    OrderType,

    OrderStatus,

    PositionSide,

    PaperAsset,

    PaperAccountState,

    PaperOrderRequest,

    PaperOrder,

    PaperExecutionResult,

    PaperTrade,

    MarketTick,

    PaperPosition,

    PaperSignal,

    PaperTradingConfig,

    PaperPerformance,

    PaperEventType,

    PaperEvent

} from "./types";




/**
==========================================================
Account
==========================================================
*/

export {

    default as paperAccount,

    PaperTradingAccount

} from "./account";





/**
==========================================================
Trading Engine
==========================================================
*/

export {

    default as paperTradingEngine,

    PaperTradingEngine

} from "./engine";



export type {

    PaperTradeRequest,

    PaperTradeResult,

    PaperEngineConfig

} from "./engine";





/**
==========================================================
Order Management
==========================================================
*/

export {

    default as paperOrders,

    PaperOrderManager

} from "./orders";





/**
==========================================================
Execution Simulator
==========================================================
*/

export {

    default as paperSimulator,

    PaperTradingSimulator

} from "./simulator";


export type {

    SimulatorConfig

} from "./simulator";





/**
==========================================================
Event Tracker
==========================================================
*/

export {

    default as paperTracker,

    PaperTradingTracker

} from "./tracker";


export type {

    TrackerFilter

} from "./tracker";
