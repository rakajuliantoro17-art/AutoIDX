/**
==========================================================
AURA Trade OS
Event Dispatcher
Version : 0.0.7 Alpha
==========================================================
*/

import {
    EventStatus,
} from "./eventStatus";

import type {
    AURAEvent,
} from "./event";

import type {
    EventRegistry,
} from "./eventRegistry";

import {
    createEventResult,
    createFailedEventResult,
} from "./eventResult";

import type {
    EventResult,
} from "./eventResult";


export class EventDispatcher {

    public constructor(
        private readonly registry:
            EventRegistry,
    ) {}


    public async dispatch(
        event: AURAEvent,
    ):
        Promise<EventResult> {

        const started =
            Date.now();

        const handlers =
            this.registry.getHandlers(
                event.type,
            );


        if (handlers.length === 0) {

            event.markProcessed();

            return {
                ...createEventResult(),
                eventId: event.id,
                durationMs:
                    Date.now() -
                    started,
            };
        }


        event.markProcessing();


        try {

            let lastData:
                unknown;


            for (
                const registration
                of handlers
            ) {

                const result =
                    await registration.handler(
                        event,
                    );


                if (!result.success) {

                    event.markFailed();

                    return {
                        ...result,
                        eventId: event.id,
                        durationMs:
                            Date.now() -
                            started,
                    };
                }


                lastData =
                    result.data;


                if (
                    registration.once
                ) {

                    this.registry.unregister(
                        event.type,
                        registration.id,
                    );
                }
            }


            event.markProcessed();


            return {
                success: true,
                eventId: event.id,
                data: lastData,
                durationMs:
                    Date.now() -
                    started,
                timestamp:
                    Date.now(),
            };

        } catch (error) {

            event.markFailed();

            return {
                ...createFailedEventResult(
                    error,
                ),
                eventId: event.id,
                durationMs:
                    Date.now() -
                    started,
            };
        }
    }
}


export default EventDispatcher;
