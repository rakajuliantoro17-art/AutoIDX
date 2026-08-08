/**
==========================================================
AURA Trade OS
Event Category
Version : 0.0.7 Alpha
==========================================================
Event Category Classification
==========================================================
*/

export const EventCategory = {

    MARKET: "MARKET",
    INDICATOR: "INDICATOR",
    STRATEGY: "STRATEGY",
    RISK: "RISK",
    ORDER: "ORDER",
    POSITION: "POSITION",
    PORTFOLIO: "PORTFOLIO",
    TELEMETRY: "TELEMETRY",
    ERROR: "ERROR",
    SYSTEM: "SYSTEM",

} as const;

export type EventCategory =
    typeof EventCategory[keyof typeof EventCategory];
