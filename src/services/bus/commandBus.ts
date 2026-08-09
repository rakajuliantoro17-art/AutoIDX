/**
==========================================================
AURA Trade OS
Command Bus
Version : 0.0.7 Alpha
==========================================================
*/

import {
    BusType,
} from "./busType";

import {
    createBusMessage,
} from "./busMessage";

import {
    BusDispatcher,
} from "./busDispatcher";

import {
    CommandRegistry,
} from "./commandRegistry";

import {
    BusMiddlewareChain,
} from "./busMiddleware";

import type {
    BusResult,
} from "./busResult";

export interface CommandBusOptions {
    readonly source?: string;
}

export class CommandBus {
    public readonly registry:
        CommandRegistry;

    public readonly middleware:
        BusMiddlewareChain;

    private readonly dispatcher:
        BusDispatcher;

    private readonly source:
        string;

    public constructor(
        options:
            CommandBusOptions = {},
    ) {
        this.registry =
            new CommandRegistry();

        this.middleware =
            new BusMiddlewareChain();

        this.dispatcher =
            new BusDispatcher(
                this.registry,
            );

        this.source =
            options.source ??
            "aura-command-bus";
    }

    public async dispatch<T = unknown>(
        command: {
            readonly name: string;
            readonly payload: T;
            readonly correlationId?: string;
            readonly causationId?: string;
            readonly metadata?: Record<string, unknown>;
        },
    ): Promise<BusResult> {
        const message =
            createBusMessage(
                command.name,
                command.payload,
                {
                    type:
                        BusType.COMMAND,

                    correlationId:
                        command.correlationId,

                    causationId:
                        command.causationId,

                    metadata:
                        command.metadata,

                    source:
                        this.source,
                },
            );

        return this.middleware.execute(
            message,

            {
                dispatchId:
                    message.id,

                correlationId:
                    message.correlationId,

                causationId:
                    message.causationId,

                source:
                    this.source,

                startedAt:
                    Date.now(),

                metadata:
                    message.metadata,

                data: {},
            },

            (
                currentMessage,
            ) =>
                this.dispatcher.dispatch(
                    currentMessage,
                ),
        );
    }

    public register<
        TCommand = unknown,
        TResult = unknown,
    >(
        handler: import("./commandHandler").CommandHandler<
            TCommand,
            TResult
        >,
    ): void {
        this.registry.registerCommand(
            handler,
        );
    }
}

export const commandBus =
    new CommandBus();

export default CommandBus;
