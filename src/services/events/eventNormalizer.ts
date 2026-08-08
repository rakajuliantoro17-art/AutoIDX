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


export function normalizeEvent(
    event:
        AURAEvent |
        EventOptions,
): AURAEvent {

    if (
        event instanceof AURAEvent
    ) {
        return event;
    }

    return new AURAEvent(event);
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
