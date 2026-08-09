/**
==========================================================
AURA Trade OS
Application Bus
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
    CommandBus,
    commandBus,
} from "./commandBus";

import {
    EventBus,
    eventBus,
} from "./eventBus";

import {
    MessageRouter,
} from "./messageRouter";

import {
    MessageQueue,
} from "./messageQueue";

import {
    MessageProcessor,
} from "./messageProcessor";

import type {
    BusResult,
} from "./busResult";

export class ApplicationBus {
    public readonly commandBus:
        CommandBus;

    public readonly eventBus:
        EventBus;

    public readonly router:
        MessageRouter;

    public readonly queue:
        MessageQueue;

    public readonly processor:
        MessageProcessor;

    public constructor(
        commands:
            CommandBus =
            commandBus,

        events:
            EventBus =
            eventBus,
    ) {
        this.commandBus =
            commands;

        this.eventBus =
            events;

        this.router =
            new MessageRouter(
                this.commandBus,
                this.eventBus,
            );

        this.queue =
            new MessageQueue();

        this.processor =
            new MessageProcessor(
                this.queue,
                this.router,
            );
    }

    public async command<
        T = unknown,
    >(
        name: string,
        payload: T,
        options: {
            readonly correlationId?: string;
            readonly causationId?: string;
            readonly metadata?: Record<string, unknown>;
        } = {},
    ): Promise<BusResult> {
        return this.commandBus.dispatch({
            name,
            payload,

            correlationId:
                options.correlationId,

            causationId:
                options.causationId,

            metadata:
                options.metadata,
        });
    }

    public async event<
        T = unknown,
    >(
        name: string,
        payload: T,
        options: {
            readonly correlationId?: string;
            readonly causationId?: string;
            readonly metadata?: Record<string, unknown>;
        } = {},
    ) {
        return this.eventBus.publish({
            name,
            payload,

            correlationId:
                options.correlationId,

            causationId:
                options.causationId,

            metadata:
                options.metadata,
        });
    }

    public enqueue<
        T = unknown,
    >(
        type: BusType,
        name: string,
        payload: T,
        options: {
            readonly correlationId?: string;
            readonly causationId?: string;
            readonly metadata?: Record<string, unknown>;
        } = {},
    ): string {
        const message =
            createBusMessage(
                name,
                payload,
                {
                    type,

                    correlationId:
                        options.correlationId,

                    causationId:
                        options.causationId,

                    metadata:
                        options.metadata,
                },
            );

        this.processor.enqueue(
            message,
        );

        return message.id;
    }

    public async process():
        Promise<unknown[]> {
        return this.processor.processOnce();
    }

    public start(): void {
        this.processor.start();
    }

    public stop(): void {
        this.processor.stop();
    }
}

export const applicationBus =
    new ApplicationBus();

export default ApplicationBus;
