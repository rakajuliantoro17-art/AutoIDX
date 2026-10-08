/**
==========================================================
AURA Trade OS
Event Type
Version : 0.0.7 Alpha
==========================================================
Core Event Type Registry
==========================================================
*/

export const EventType = {

    /* Market */
    MARKET_TICK: "MARKET_TICK",
    MARKET_DEPTH_UPDATED: "MARKET_DEPTH_UPDATED",
    MARKET_TRADE: "MARKET_TRADE",

    /* Indicator */
    INDICATOR_CALCULATED: "INDICATOR_CALCULATED",
    INDICATOR_UPDATED: "INDICATOR_UPDATED",

    /* Strategy */
    STRATEGY_STARTED: "STRATEGY_STARTED",
    STRATEGY_STOPPED: "STRATEGY_STOPPED",
    SIGNAL_GENERATED: "SIGNAL_GENERATED",

    /* Risk */
    RISK_LIMIT_BREACHED: "RISK_LIMIT_BREACHED",
    RISK_EVALUATED: "RISK_EVALUATED",

    /* Order */
    ORDER_CREATED: "ORDER_CREATED",
    ORDER_FILLED: "ORDER_FILLED",
    ORDER_CANCELLED: "ORDER_CANCELLED",

    /* Position */
    POSITION_OPENED: "POSITION_OPENED",
    POSITION_CLOSED: "POSITION_CLOSED",

    /* Portfolio */
    PORTFOLIO_UPDATED: "PORTFOLIO_UPDATED",
    PORTFOLIO_BALANCE_CHANGED: "PORTFOLIO_BALANCE_CHANGED",

    /* Telemetry */
    TELEMETRY_COLLECTED: "TELEMETRY_COLLECTED",
    TELEMETRY_EXPORTED: "TELEMETRY_EXPORTED",

    /* Error / System */
    ERROR_OCCURRED: "ERROR_OCCURRED",
    SYSTEM_ERROR: "SYSTEM_ERROR",
    SYSTEM_STARTUP: "SYSTEM_STARTUP",
    SYSTEM_SHUTDOWN: "SYSTEM_SHUTDOWN",

} as const;

export type EventType =
    typeof EventType[keyof typeof EventType];
