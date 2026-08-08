/**
==========================================================
AURA Trade OS
Event Normalizer
Version : 0.0.7 Alpha
==========================================================
*/

import {
    AURAEvent,
} from "./event";

import {
    EventType,
} from "./eventType";

import type {
    EventOptions,
} from "./event";

import type {
    EventPayload,
} from "./eventPayload";

export function normalizeEvent<T = EventPayload>(
    event:
        AURAEvent<T> |
        EventOptions<T>,
): AURAEvent<T> {

    if (
        event instanceof AURAEvent
    ) {
        return event as AURAEvent<T>;
    }

    return new AURAEvent<T>(event);

}

export function normalizeEventType(
    type:
        EventType |
        string,
):
    EventType {

    if (
        Object.values(
            EventType,
        ).includes(
            type as EventType,
        )
    ) {
        return type as EventType;
    }

    throw new Error(
        `Unknown event type: ${type}`,
    );

}

export function isEventType(
    value: unknown,
): value is EventType {
    return (
        typeof value === "string" &&
        Object.values(
            EventType,
        ).includes(
            value as EventType,
        )
    );
}
