/**
==========================================================
AURA Trade OS
System Events
Version : 0.2.0 Alpha
==========================================================
System Event Facade
==========================================================
*/

import {

    eventEmitter,

} from "./eventEmitter";

import {

    eventListener,

} from "./eventListener";

import {

    SYSTEM_EVENTS,

} from "./eventTypes";

import type {

    EventHandler,

} from "./eventBus";





/*
==========================================================
System Events
==========================================================
*/

export class SystemEvents {

    /*
    ======================================================
    Startup
    ======================================================
    */

    public async startup(

        payload?: unknown,

    ): Promise<void> {

        await eventEmitter.emit(

            SYSTEM_EVENTS.STARTUP,

            payload,

        );

    }





    /*
    ======================================================
    Shutdown
    ======================================================
    */

    public async shutdown(

        payload?: unknown,

    ): Promise<void> {

        await eventEmitter.emit(

            SYSTEM_EVENTS.SHUTDOWN,

            payload,

        );

    }





    /*
    ======================================================
    Restart
    ======================================================
    */

    public async restart(

        payload?: unknown,

    ): Promise<void> {

        await eventEmitter.emit(

            SYSTEM_EVENTS.RESTART,

            payload,

        );

    }





    /*
    ======================================================
    Ready
    ======================================================
    */

    public async ready(

        payload?: unknown,

    ): Promise<void> {

        await eventEmitter.emit(

            SYSTEM_EVENTS.READY,

            payload,

        );

    }





    /*
    ======================================================
    Maintenance Enabled
    ======================================================
    */

    public async maintenanceEnabled(

        payload?: unknown,

    ): Promise<void> {

        await eventEmitter.emit(

            SYSTEM_EVENTS

                .MAINTENANCE_ENABLED,

            payload,

        );

    }





    /*
    ======================================================
    Maintenance Disabled
    ======================================================
    */

    public async maintenanceDisabled(

        payload?: unknown,

    ): Promise<void> {

        await eventEmitter.emit(

            SYSTEM_EVENTS

                .MAINTENANCE_DISABLED,

            payload,

        );

    }





    /*
    ======================================================
    Listen Startup
    ======================================================
    */

    public onStartup(

        handler: EventHandler,

    ): void {

        eventListener.on(

            SYSTEM_EVENTS.STARTUP,

            handler,

        );

    }





    /*
    ======================================================
    Listen Shutdown
    ======================================================
    */

    public onShutdown(

        handler: EventHandler,

    ): void {

        eventListener.on(

            SYSTEM_EVENTS.SHUTDOWN,

            handler,

        );

    }





    /*
    ======================================================
    Listen Restart
    ======================================================
    */

    public onRestart(

        handler: EventHandler,

    ): void {

        eventListener.on(

            SYSTEM_EVENTS.RESTART,

            handler,

        );

    }





    /*
    ======================================================
    Listen Ready
    ======================================================
    */

    public onReady(

        handler: EventHandler,

    ): void {

        eventListener.on(

            SYSTEM_EVENTS.READY,

            handler,

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const systemEvents =

    new SystemEvents();
```

