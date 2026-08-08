/**
==========================================================
AURA Trade OS
Event Priority
Version : 0.0.7 Alpha
==========================================================
Event Priority Levels
==========================================================
*/

export const EventPriority = {

    LOW: "LOW",
    NORMAL: "NORMAL",
    HIGH: "HIGH",
    CRITICAL: "CRITICAL",

} as const;

export type EventPriority =
    typeof EventPriority[keyof typeof EventPriority];
