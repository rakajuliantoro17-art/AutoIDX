/**
==========================================================
AURA Trade OS
Event Subscriber
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    EventType,
} from "./eventType";

import type {
    EventHandler,
} from "./eventHandler";


export interface EventSubscriber {
    readonly id: string;

    readonly events:
        readonly EventType[];

    readonly handler:
        EventHandler;

    readonly priority?:
        number;

    readonly once?:
        boolean;

    readonly enabled?:
        boolean;
}


export function createSubscriberId(): string {
    return [
        "sub",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
