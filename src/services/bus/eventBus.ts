/**
==========================================================
AURA Trade OS
Event Bus
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
    createBusFailure,
    createBusSuccess,
} from "./busResult";

import {
    EventRegistry,
} from "./eventRegistry";

import {
    BusMiddlewareChain,
} from "./busMiddleware";

import type {
    BusResult,
} from "./busResult";

export interface EventBusOptions {
    readonly source?: string;
}

export class EventBus {
    public readonly registry:
        EventRegistry;

    public readonly middleware:
        BusMiddlewareChain;

    private readonly source:
        string;

    public constructor(
        options:
            EventBusOptions = {},
    ) {
        this.registry =
            new EventRegistry();

        this.middleware =
            new BusMiddlewareChain();

        this.source =
            options.source ??
            "aura-event-bus";
    }

    public async publish<
        TEvent = unknown,
    >(
        event: {
            readonly name: string;
            readonly payload: TEvent;
            readonly correlationId?: string;
            readonly causationId?: string;
            readonly metadata?: Record<string, unknown>;
        },
    ): Promise<
        readonly BusResult[]
    > {
        const startedAt =
            Date.now();

        const message =
            createBusMessage(
                event.name,
                event.payload,
                {
                    type:
                        BusType.EVENT,

                    correlationId:
                        event.correlationId,

                    causationId:
                        event.causationId,

                    metadata:
                        event.metadata,

                    source:
                        this.source,
                },
            );

        const handlers =
            this.registry.get(
                event.name,
            );

        if (
            handlers.length === 0
        ) {
            return [
                createBusFailure(
                    message.id,

                    new Error(
                        `No event handlers registered for: ${event.name}`,
                    ),
                    {
                        durationMs:
                            Date.now() -
                            startedAt,
                    },
                ),
            ];
        }

        const results:
            BusResult[] = [];

        for (
            const handler
            of handlers
        ) {
            const result =
                await this.middleware.execute(
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

                    async (
                        currentMessage,
                    ) => {
                        try {
                            const data =
                                await handler.handle(
                                    currentMessage.payload,
                                );

                            return createBusSuccess(
                                currentMessage.id,
                                data,
                                {
                                    handlerName:
                                        handler.name,

                                    durationMs:
                                        Date.now() -
                                        startedAt,
                                },
                            );
                        } catch (error) {
                            return createBusFailure(
                                currentMessage.id,
                                error,
                                {
                                    handlerName:
                                        handler.name,

                                    durationMs:
                                        Date.now() -
                                        startedAt,
                                },
                            );
                        }
                    },
                );

            results.push(
                result,
            );
        }

        return results;
    }

    public subscribe<
        TEvent = unknown,
        TResult = unknown,
    >(
        handler:
            import("./eventHandler").EventHandler<
                TEvent,
                TResult
            >,
    ): void {
        this.registry.register(
            handler,
        );
    }

    public unsubscribe(
        eventName: string,
        handlerName?: string,
    ): boolean {
        return this.registry.unregister(
            eventName,
            handlerName,
        );
    }
}

export const eventBus =
    new EventBus();

export default EventBus;
