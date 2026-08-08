/**
==========================================================
AURA Trade OS
Event Publisher
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    AURAEvent,
} from "./event";

import type {
    EventResult,
} from "./eventResult";


export interface EventPublisher {
    publish<T = unknown>(
        event: AURAEvent<T>,
    ):
        EventResult |
        Promise<EventResult>;
}


export interface BatchEventPublisher
    extends EventPublisher {

    publishMany<T = unknown>(
        events:
            readonly AURAEvent<T>[],
    ):
        readonly (
            EventResult |
            Promise<EventResult>
        )[];
}
