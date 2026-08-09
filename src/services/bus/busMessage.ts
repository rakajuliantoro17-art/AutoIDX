/**
==========================================================
AURA Trade OS
Bus Message
Version : 0.0.7 Alpha
==========================================================
*/

import {
    BusType,
} from "./busType";

export interface BusMessage<TPayload = unknown> {
    readonly id: string;

    readonly type: BusType;

    readonly name: string;

    readonly payload: TPayload;

    readonly timestamp: number;

    readonly correlationId?: string;

    readonly causationId?: string;

    readonly source?: string;

    readonly metadata:
        Record<string, unknown>;
}

export function createBusMessage<TPayload = unknown>(
    name: string,
    payload: TPayload,
    options: {
        readonly id?: string;
        readonly type?: BusType;
        readonly correlationId?: string;
        readonly causationId?: string;
        readonly source?: string;
        readonly metadata?: Record<string, unknown>;
    } = {},
): BusMessage<TPayload> {
    return {
        id:
            options.id ??
            createBusMessageId(),

        type:
            options.type ??
            BusType.MESSAGE,

        name,

        payload,

        timestamp:
            Date.now(),

        correlationId:
            options.correlationId,

        causationId:
            options.causationId,

        source:
            options.source,

        metadata:
            options.metadata ??
            {},
    };
}

export function createBusMessageId(): string {
    return [
        "msg",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}
