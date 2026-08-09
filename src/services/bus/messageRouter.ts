/**
==========================================================
AURA Trade OS
Message Router
Version : 0.0.7 Alpha
==========================================================
*/

import {
    BusType,
} from "./busType";

import type {
    BusMessage,
} from "./busMessage";

import type {
    CommandBus,
} from "./commandBus";

import type {
    EventBus,
} from "./eventBus";

export class MessageRouter {
    public constructor(
        private readonly commandBus:
            CommandBus,

        private readonly eventBus:
            EventBus,
    ) {}

    public async route(
        message:
            BusMessage,
    ): Promise<unknown> {
        switch (
            message.type
        ) {
            case BusType.COMMAND:
                return this.commandBus.dispatch({
                    name:
                        message.name,

                    payload:
                        message.payload,

                    correlationId:
                        message.correlationId,

                    causationId:
                        message.causationId,

                    metadata:
                        message.metadata,
                });

            case BusType.EVENT:
                return this.eventBus.publish({
                    name:
                        message.name,

                    payload:
                        message.payload,

                    correlationId:
                        message.correlationId,

                    causationId:
                        message.causationId,

                    metadata:
                        message.metadata,
                });

            default:
                throw new Error(
                    `Unsupported bus message type: ${message.type}`,
                );
        }
    }
}

export default MessageRouter;
