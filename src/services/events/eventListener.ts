/**
==========================================================
AURA Trade OS
Event Listener
Version : 0.2.0 Alpha
==========================================================
High Level Event Listener
==========================================================
*/

import { logger } from "@/services/logger";

import {

    eventBus,

    EventHandler,

} from "./eventBus";





/*
==========================================================
Event Listener
==========================================================
*/

export class EventListener {

    /*
    ======================================================
    Listen
    ======================================================
    */

    public on<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        logger.debug(

            `Listening "${event}".`,

        );



        eventBus.on(

            event,

            handler,

        );

    }





    /*
    ======================================================
    Listen Once
    ======================================================
    */

    public once<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        logger.debug(

            `Listening once "${event}".`,

        );



        eventBus.once(

            event,

            handler,

        );

    }





    /*
    ======================================================
    Remove Listener
    ======================================================
    */

    public off<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        logger.debug(

            `Removing listener "${event}".`,

        );



        eventBus.off(

            event,

            handler,

        );

    }





    /*
    ======================================================
    System
    ======================================================
    */

    public system<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `system.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Trading
    ======================================================
    */

    public trading<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `trading.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Exchange
    ======================================================
    */

    public exchange<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `exchange.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Portfolio
    ======================================================
    */

    public portfolio<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `portfolio.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Strategy
    ======================================================
    */

    public strategy<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `strategy.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Recovery
    ======================================================
    */

    public recovery<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `recovery.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Monitor
    ======================================================
    */

    public monitor<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `monitor.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Security
    ======================================================
    */

    public security<T>(

        event: string,

        handler: EventHandler<T>,

    ): void {

        this.on(

            `security.${event}`,

            handler,

        );

    }





    /*
    ======================================================
    Listener Count
    ======================================================
    */

    public count(

        event: string,

    ): number {

        return eventBus.listenerCount(

            event,

        );

    }





    /*
    ======================================================
    Events
    ======================================================
    */

    public events(): string[] {

        return eventBus.events();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const eventListener =

    new EventListener();
```

