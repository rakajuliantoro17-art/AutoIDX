/**
==========================================================
AURA Trade OS
Event
Version : 0.0.7 Alpha
==========================================================
Core Event Model
==========================================================
*/

import {
    EventCategory,
} from "./eventCategory";

import {
    EventPriority,
} from "./eventPriority";

import {
    EventStatus,
} from "./eventStatus";

import {
    EventType,
} from "./eventType";

import type {
    EventContext,
} from "./eventContext";

import type {
    EventMetadata,
} from "./eventMetadata";

import type {
    EventPayload,
} from "./eventPayload";


export interface EventOptions<T = EventPayload> {
    readonly id?: string;

    readonly type:
        EventType;

    readonly category?:
        EventCategory;

    readonly priority?:
        EventPriority;

    readonly status?:
        EventStatus;

    readonly payload?:
        T;

    readonly metadata?:
        EventMetadata;

    readonly context?:
        EventContext;

    readonly timestamp?:
        number;
}


export interface SerializedEvent {
    readonly id: string;
    readonly type: EventType;
    readonly category: EventCategory;
    readonly priority: EventPriority;
    readonly status: EventStatus;

    readonly payload: EventPayload;

    readonly metadata: EventMetadata;
    readonly context: EventContext;

    readonly timestamp: number;
}


export class AURAEvent<T = EventPayload> {

    public readonly id: string;

    public readonly type: EventType;

    public readonly category: EventCategory;

    public readonly priority: EventPriority;

    public status: EventStatus;

    public readonly payload: T;

    public readonly metadata: EventMetadata;

    public readonly context: EventContext;

    public readonly timestamp: number;

    public constructor(
        options: EventOptions<T>,
    ) {
        this.id =
            options.id ??
            createEventId();

        this.type =
            options.type;

        this.category =
            options.category ??
            resolveEventCategory(
                options.type,
            );

        this.priority =
            options.priority ??
            EventPriority.NORMAL;

        this.status =
            options.status ??
            EventStatus.CREATED;

        this.payload =
            options.payload ??
            (null as T);

        this.metadata =
            options.metadata ??
            {};

        this.context =
            options.context ??
            {};

        this.timestamp =
            options.timestamp ??
            Date.now();
    }

    public markQueued(): this {
        this.status =
            EventStatus.QUEUED;

        return this;
    }

    public markProcessing(): this {
        this.status =
            EventStatus.PROCESSING;

        return this;
    }

    public markProcessed(): this {
        this.status =
            EventStatus.PROCESSED;

        return this;
    }

    public markFailed(): this {
        this.status =
            EventStatus.FAILED;

        return this;
    }

    public markCancelled(): this {
        this.status =
            EventStatus.CANCELLED;

        return this;
    }

    public isTerminal(): boolean {
        return (
            this.status === EventStatus.PROCESSED ||
            this.status === EventStatus.FAILED ||
            this.status === EventStatus.CANCELLED
        );
    }

    public serialize(): SerializedEvent {
        return {
            id: this.id,
            type: this.type,
            category: this.category,
            priority: this.priority,
            status: this.status,
            payload: this.payload as EventPayload,
            metadata: this.metadata,
            context: this.context,
            timestamp: this.timestamp,
        };
    }

    public static from<T = EventPayload>(
        event: SerializedEvent,
    ): AURAEvent<T> {
        return new AURAEvent<T>({
            id: event.id,
            type: event.type,
            category: event.category,
            priority: event.priority,
            status: event.status,
            payload: event.payload as T,
            metadata: event.metadata,
            context: event.context,
            timestamp: event.timestamp,
        });
    }
}


export function createEventId(): string {
    return [
        "evt",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}


export function resolveEventCategory(
    type: EventType,
): EventCategory {

    if (type.startsWith("MARKET_")) {
        return EventCategory.MARKET;
    }

    if (type.startsWith("INDICATOR_")) {
        return EventCategory.INDICATOR;
    }

    if (
        type.startsWith("STRATEGY_") ||
        type === EventType.SIGNAL_GENERATED
    ) {
        return EventCategory.STRATEGY;
    }

    if (type.startsWith("RISK_")) {
        return EventCategory.RISK;
    }

    if (type.startsWith("ORDER_")) {
        return EventCategory.ORDER;
    }

    if (type.startsWith("POSITION_")) {
        return EventCategory.POSITION;
    }

    if (type.startsWith("PORTFOLIO_")) {
        return EventCategory.PORTFOLIO;
    }

    if (type.startsWith("TELEMETRY_")) {
        return EventCategory.TELEMETRY;
    }

    if (
        type === EventType.ERROR_OCCURRED ||
        type === EventType.SYSTEM_ERROR
    ) {
        return EventCategory.ERROR;
    }

    return EventCategory.SYSTEM;
}


export function isAURAEvent(
    value: unknown,
): value is AURAEvent {
    return value instanceof AURAEvent;
}


export default AURAEvent;
