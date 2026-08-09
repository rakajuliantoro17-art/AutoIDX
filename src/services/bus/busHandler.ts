/**
==========================================================
AURA Trade OS
Bus Handler
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    BusMessage,
} from "./busMessage";

import type {
    BusContext,
} from "./busContext";

export type BusHandler<
    TPayload = unknown,
    TResult = unknown,
> = (
    message: BusMessage<TPayload>,
    context: BusContext,
) =>
    TResult |
    Promise<TResult>;

export interface BusHandlerDefinition<
    TPayload = unknown,
    TResult = unknown,
> {
    readonly name: string;

    readonly messageName: string;

    readonly handler:
        BusHandler<TPayload, TResult>;

    readonly metadata?:
        Record<string, unknown>;
}

export function createBusHandler<
    TPayload = unknown,
    TResult = unknown,
>(
    definition:
        BusHandlerDefinition<TPayload, TResult>,
): BusHandlerDefinition<TPayload, TResult> {
    return {
        ...definition,
    };
}
