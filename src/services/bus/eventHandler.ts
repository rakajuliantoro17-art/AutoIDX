/**
==========================================================
AURA Trade OS
Event Handler
Version : 0.0.7 Alpha
==========================================================
*/

import {
    BusType,
} from "./busType";

import type {
    BusHandler,
    BusHandlerDefinition,
} from "./busHandler";

export interface EventHandler<
    TEvent = unknown,
    TResult = unknown,
> {
    readonly name: string;

    readonly eventName: string;

    readonly handle:
        (
            event: TEvent,
        ) =>
            TResult |
            Promise<TResult>;
}

export function toEventBusHandler<
    TEvent = unknown,
    TResult = unknown,
>(
    handler:
        EventHandler<TEvent, TResult>,
): BusHandlerDefinition<TEvent, TResult> {
    const execute: BusHandler<
        TEvent,
        TResult
    > = async (
        message,
    ) =>
        handler.handle(
            message.payload,
        );

    return {
        name:
            handler.name,

        messageName:
            handler.eventName,

        handler: execute,

        metadata: {
            busType:
                BusType.EVENT,
        },
    };
}
