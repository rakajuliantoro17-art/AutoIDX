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

    LOW: 0,
    NORMAL: 1,
    HIGH: 2,
    CRITICAL: 3,

} as const;

export type EventPriority =
    typeof EventPriority[keyof typeof EventPriority];
