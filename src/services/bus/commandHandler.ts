/**
==========================================================
AURA Trade OS
Command Handler
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

export interface CommandHandler<
    TCommand = unknown,
    TResult = unknown,
> {
    readonly name: string;

    readonly commandName: string;

    readonly execute:
        (
            command: TCommand,
        ) =>
            TResult |
            Promise<TResult>;
}

export function toCommandBusHandler<
    TCommand = unknown,
    TResult = unknown,
>(
    handler:
        CommandHandler<TCommand, TResult>,
): BusHandlerDefinition<TCommand, TResult> {
    const execute: BusHandler<
        TCommand,
        TResult
    > = async (
        message,
    ) =>
        handler.execute(
            message.payload,
        );

    return {
        name:
            handler.name,

        messageName:
            handler.commandName,

        handler: execute,

        metadata: {
            busType:
                BusType.COMMAND,
        },
    };
}
