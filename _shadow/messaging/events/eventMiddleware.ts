/**
==========================================================
AURA Trade OS
Event Middleware
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    AURAEvent,
} from "./event";

import type {
    EventResult,
} from "./eventResult";


export type EventMiddleware =
    (
        event: AURAEvent,
        next: (
            event: AURAEvent,
        ) =>
            EventResult |
            Promise<EventResult>,
    ) =>
        EventResult |
        Promise<EventResult>;


export class EventMiddlewareChain {

    private readonly middleware:
        EventMiddleware[] = [];


    public use(
        middleware:
            EventMiddleware,
    ): this {

        this.middleware.push(
            middleware,
        );

        return this;
    }


    public async execute(
        event: AURAEvent,
        terminal:
            (
                event: AURAEvent,
            ) =>
                EventResult |
                Promise<EventResult>,
    ):
        Promise<EventResult> {

        let index = -1;


        const dispatch =
            async (
                current:
                    AURAEvent,
            ):
                Promise<EventResult> => {

                index += 1;


                if (
                    index >=
                    this.middleware.length
                ) {
                    return terminal(
                        current,
                    );
                }


                const middleware =
                    this.middleware[index];


                return middleware(
                    current,
                    dispatch,
                );
            };


        return dispatch(event);
    }


    public clear(): void {
        this.middleware.length = 0;
    }


    public size(): number {
        return this.middleware.length;
    }
}


export default EventMiddlewareChain;
