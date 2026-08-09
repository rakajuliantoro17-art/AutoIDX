/**
==========================================================
AURA Trade OS
Bus Dispatcher
Version : 0.0.7 Alpha
==========================================================
*/

import {
    BusError,
    BusErrorCode,
} from "./busError";

import {
    createBusContext,
} from "./busContext";

import {
    createBusFailure,
    createBusSuccess,
} from "./busResult";

import type {
    BusMessage,
} from "./busMessage";

import type {
    BusRegistry,
} from "./busRegistry";

import type {
    BusResult,
} from "./busResult";

export class BusDispatcher {
    public constructor(
        private readonly registry:
            BusRegistry,
    ) {}

    public async dispatch(
        message:
            BusMessage,
    ): Promise<BusResult> {
        const startedAt =
            Date.now();

        const handler =
            this.registry.get(
                message.name,
            );

        if (!handler) {
            return createBusFailure(
                message.id,

                new BusError(
                    `No handler registered for message: ${message.name}`,
                    {
                        code:
                            BusErrorCode.HANDLER_NOT_FOUND,

                        messageId:
                            message.id,
                    },
                ),
                {
                    durationMs:
                        Date.now() -
                        startedAt,
                },
            );
        }

        const context =
            createBusContext({
                correlationId:
                    message.correlationId,

                causationId:
                    message.causationId,

                source:
                    message.source,

                metadata:
                    message.metadata,
            });

        try {
            const data =
                await handler.handler(
                    message,
                    context,
                );

            return createBusSuccess(
                message.id,
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
                message.id,

                new BusError(
                    `Handler failed: ${handler.name}`,
                    {
                        code:
                            BusErrorCode.DISPATCH_FAILED,

                        messageId:
                            message.id,

                        handlerName:
                            handler.name,

                        cause:
                            error,
                    },
                ),
                {
                    handlerName:
                        handler.name,

                    durationMs:
                        Date.now() -
                        startedAt,
                },
            );
        }
    }
}

export default BusDispatcher;
