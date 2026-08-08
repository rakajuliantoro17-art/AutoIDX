/**
==========================================================
AURA Trade OS
Event Handler
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    AURAEvent,
} from "./event";

import type {
    EventResult,
} from "./eventResult";


export type EventHandler<T = unknown> =
    (
        event: AURAEvent<T>,
    ) =>
        EventResult |
        Promise<EventResult>;


export interface EventHandlerRegistration {
    readonly id: string;
    readonly handler: EventHandler;
    readonly once?: boolean;
    readonly priority?: number;
}


export function createEventHandlerId(): string {
    return [
        "handler",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
