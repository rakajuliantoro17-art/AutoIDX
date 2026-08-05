/**
==========================================================
AURA Trade OS
Event Bus
Version : 0.2.0 Alpha
==========================================================
Central Event Bus
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type EventHandler<T = unknown> = (

    payload: T,

) => void | Promise<void>;





export interface EventSubscription {

    event: string;

    handler: EventHandler;

}





/*
==========================================================
Event Bus
==========================================================
*/

export class EventBus {

    private readonly listeners =

        new Map<

            string,

            Set<EventHandler>

        >();





    /*
    ======================================================
    Subscribe
    ======================================================
    */

    public on<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        if (

            !this.listeners.has(event)

        ) {

            this.listeners.set(

                event,

                new Set(),

            );

        }



        this.listeners

            .get(event)!

            .add(handler);



        logger.debug(

            `Subscribed to "${event}".`,

        );

    }





    /*
    ======================================================
    Subscribe Once
    ======================================================
    */

    public once<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        const wrapper: EventHandler =

            async (payload) => {

                this.off(

                    event,

                    wrapper,

                );



                await handler(

                    payload as T,

                );

            };



        this.on(

            event,

            wrapper,

        );

    }





    /*
    ======================================================
    Unsubscribe
    ======================================================
    */

    public off(

        event: string,

        handler: EventHandler,

    ): void {

        const handlers =

            this.listeners.get(event);



        if (!handlers) {

            return;

        }



        handlers.delete(handler);



        if (

            handlers.size === 0

        ) {

            this.listeners.delete(event);

        }



        logger.debug(

            `Unsubscribed from "${event}".`,

        );

    }





    /*
    ======================================================
    Emit
    ======================================================
    */

    public async emit<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        const handlers =

            this.listeners.get(event);



        if (!handlers) {

            return;

        }



        logger.debug(

            `Emitting "${event}".`,

        );



        for (

            const handler

            of handlers

        ) {

            try {

                await handler(

                    payload,

                );

            }

            catch (error) {

                logger.error(

                    `Event "${event}" failed.`,

                    error,

                );

            }

        }

    }





    /*
    ======================================================
    Clear Event
    ======================================================
    */

    public clear(

        event: string,

    ): void {

        this.listeners.delete(

            event,

        );

    }





    /*
    ======================================================
    Clear All
    ======================================================
    */

    public clearAll(): void {

        this.listeners.clear();

    }





    /*
    ======================================================
    Listener Count
    ======================================================
    */

    public listenerCount(

        event: string,

    ): number {

        return (

            this.listeners.get(

                event,

            )?.size ?? 0

        );

    }





    /*
    ======================================================
    Events
    ======================================================
    */

    public events(): string[] {

        return [

            ...this.listeners.keys(),

        ].sort();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const eventBus =

    new EventBus();
```
