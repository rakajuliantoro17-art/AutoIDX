/**
==========================================================
AURA Trade OS
Event Emitter
Version : 0.2.0 Alpha
==========================================================
High Level Event Publisher
==========================================================
*/

import logger from "@/services/logger";

import {

    eventBus,

} from "./eventBus";





/*
==========================================================
Event Emitter
==========================================================
*/

export class EventEmitter {

    /*
    ======================================================
    Emit
    ======================================================
    */

    public async emit<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        logger.debug(

            `Publishing event "${event}".`,

        );



        await eventBus.emit(

            event,

            payload,

        );

    }





    /*
    ======================================================
    System Event
    ======================================================
    */

    public async system<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `system.${event}`,

            payload,

        );

    }





    /*
    ======================================================
    Trading Event
    ======================================================
    */

    public async trading<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `trading.${event}`,

            payload,

        );

    }





    /*
    ======================================================
    Exchange Event
    ======================================================
    */

    public async exchange<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `exchange.${event}`,

            payload,

        );

    }





    /*
    ======================================================
    Portfolio Event
    ======================================================
    */

    public async portfolio<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `portfolio.${event}`,

            payload,

        );

    }





    /*
    ======================================================
    Strategy Event
    ======================================================
    */

    public async strategy<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `strategy.${event}`,

            payload,

        );

    }





    /*
    ======================================================
    Recovery Event
    ======================================================
    */

    public async recovery<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `recovery.${event}`,

            payload,

        );

    }





    /*
    ======================================================
    Monitor Event
    ======================================================
    */

    public async monitor<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `monitor.${event}`,

            payload,

        );

    }





    /*
    ======================================================
    Security Event
    ======================================================
    */

    public async security<T>(

        event: string,

        payload?: T,

    ): Promise<void> {

        await this.emit(

            `security.${event}`,

            payload,

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const eventEmitter =

    new EventEmitter();

