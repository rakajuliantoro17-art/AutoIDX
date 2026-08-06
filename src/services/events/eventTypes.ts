/**
==========================================================
AURA Trade OS
Event Types
Version : 0.2.0 Alpha
==========================================================
Central Event Definitions
==========================================================
*/

/*
==========================================================
System Events
==========================================================
*/

export const SYSTEM_EVENTS = {

    STARTUP: "system.startup",

    SHUTDOWN: "system.shutdown",

    RESTART: "system.restart",

    READY: "system.ready",

    MAINTENANCE_ENABLED: "system.maintenance.enabled",

    MAINTENANCE_DISABLED: "system.maintenance.disabled",

} as const;





/*
==========================================================
Exchange Events
==========================================================
*/

export const EXCHANGE_EVENTS = {

    CONNECTED: "exchange.connected",

    DISCONNECTED: "exchange.disconnected",

    RECONNECTED: "exchange.reconnected",

    ERROR: "exchange.error",

    MARKET_UPDATED: "exchange.market.updated",

} as const;





/*
==========================================================
Trading Events
==========================================================
*/

export const TRADING_EVENTS = {

    SIGNAL_GENERATED: "trading.signal.generated",

    BUY_SIGNAL: "trading.buy",

    SELL_SIGNAL: "trading.sell",

    ORDER_CREATED: "trading.order.created",

    ORDER_FILLED: "trading.order.filled",

    ORDER_CANCELLED: "trading.order.cancelled",

    POSITION_OPENED: "trading.position.opened",

    POSITION_CLOSED: "trading.position.closed",

} as const;





/*
==========================================================
Portfolio Events
==========================================================
*/

export const PORTFOLIO_EVENTS = {

    UPDATED: "portfolio.updated",

    BALANCE_CHANGED: "portfolio.balance.changed",

    PROFIT_UPDATED: "portfolio.profit.updated",

} as const;





/*
==========================================================
Strategy Events
==========================================================
*/

export const STRATEGY_EVENTS = {

    STARTED: "strategy.started",

    STOPPED: "strategy.stopped",

    CHANGED: "strategy.changed",

    EXECUTED: "strategy.executed",

} as const;





/*
==========================================================
Cache Events
==========================================================
*/

export const CACHE_EVENTS = {

    REFRESHED: "cache.refreshed",

    CLEARED: "cache.cleared",

    EXPIRED: "cache.expired",

} as const;





/*
==========================================================
Recovery Events
==========================================================
*/

export const RECOVERY_EVENTS = {

    STARTED: "recovery.started",

    COMPLETED: "recovery.completed",

    FAILED: "recovery.failed",

} as const;





/*
==========================================================
Monitor Events
==========================================================
*/

export const MONITOR_EVENTS = {

    MEMORY_WARNING: "monitor.memory.warning",

    LATENCY_WARNING: "monitor.latency.warning",

    CPU_WARNING: "monitor.cpu.warning",

    HEALTH_CHANGED: "monitor.health.changed",

} as const;





/*
==========================================================
Security Events
==========================================================
*/

export const SECURITY_EVENTS = {

    LOGIN_SUCCESS: "security.login.success",

    LOGIN_FAILED: "security.login.failed",

    API_DENIED: "security.api.denied",

    RATE_LIMITED: "security.rate.limited",

    INVALID_SIGNATURE: "security.signature.invalid",

} as const;





/*
==========================================================
Combined Events
==========================================================
*/

export const EVENTS = {

    SYSTEM: SYSTEM_EVENTS,

    EXCHANGE: EXCHANGE_EVENTS,

    TRADING: TRADING_EVENTS,

    PORTFOLIO: PORTFOLIO_EVENTS,

    STRATEGY: STRATEGY_EVENTS,

    CACHE: CACHE_EVENTS,

    RECOVERY: RECOVERY_EVENTS,

    MONITOR: MONITOR_EVENTS,

    SECURITY: SECURITY_EVENTS,

} as const;





/*
==========================================================
Event Type
==========================================================
*/

export type EventCategory =

    keyof typeof EVENTS;

