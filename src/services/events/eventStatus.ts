/**
==========================================================
AURA Trade OS
Event Status
Version : 0.0.7 Alpha
==========================================================
Event Lifecycle Status
==========================================================
*/

export const EventStatus = {

    CREATED: "CREATED",
    QUEUED: "QUEUED",
    PROCESSING: "PROCESSING",
    PROCESSED: "PROCESSED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",

} as const;

export type EventStatus =
    typeof EventStatus[keyof typeof EventStatus];
