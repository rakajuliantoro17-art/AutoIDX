/**
==========================================================
AURA Trade OS
Shutdown Manager
Version : 0.2.0 Alpha
==========================================================
Graceful Shutdown Manager
==========================================================
*/

import { logger } from "@/services/logger";

import {

    application,

} from "@/services/bootstrap/application";

import {

    lifecycle,

} from "@/services/bootstrap/lifecycle";





/*
==========================================================
Shutdown Status
==========================================================
*/

export enum ShutdownStatus {

    IDLE = "IDLE",

    SHUTTING_DOWN = "SHUTTING_DOWN",

    COMPLETED = "COMPLETED",

    FAILED = "FAILED",

}





/*
==========================================================
Shutdown Manager
==========================================================
*/

export class ShutdownManager {

    private status =

        ShutdownStatus.IDLE;



    private readonly startedAt =

        new Date();





    /*
    ======================================================
    Execute
    ======================================================
    */

    public async execute(): Promise<void> {

        if (

            this.status ===

            ShutdownStatus.SHUTTING_DOWN

        ) {

            logger.warn(

                "Shutdown already in progress.",

            );



            return;

        }



        this.status =

            ShutdownStatus.SHUTTING_DOWN;



        logger.warn(

            "Graceful shutdown initiated.",

        );



        try {

            await this.beforeShutdown();



            lifecycle.stop();



            await application.stop();



            await this.afterShutdown();



            this.status =

                ShutdownStatus.COMPLETED;



            logger.info(

                "Shutdown completed successfully.",

            );

        }

        catch (error) {

            this.status =

                ShutdownStatus.FAILED;



            logger.error(

                "Shutdown failed.",

                error,

            );



            throw error;

        }

    }





    /*
    ======================================================
    Before Shutdown
    ======================================================
    */

    private async beforeShutdown(): Promise<void> {

        logger.info(

            "Preparing graceful shutdown...",

        );



        /*
        ==================================================

        Future

        - Stop Scheduler

        - Stop Trading Engine

        - Save Portfolio

        - Save Runtime State

        - Flush Cache

        ==================================================
        */

    }





    /*
    ======================================================
    After Shutdown
    ======================================================
    */

    private async afterShutdown(): Promise<void> {

        logger.info(

            "Finalizing shutdown...",

        );



        /*
        ==================================================

        Future

        - Flush Logger

        - Close Exchange

        - Close Database

        - Close Firebase

        ==================================================
        */

    }





    /*
    ======================================================
    Status
    ======================================================
    */

    public getStatus():

        ShutdownStatus {

        return this.status;

    }





    /*
    ======================================================
    Running
    ======================================================
    */

    public isRunning(): boolean {

        return (

            this.status ===

            ShutdownStatus.SHUTTING_DOWN

        );

    }





    /*
    ======================================================
    Uptime
    ======================================================
    */

    public getRunningTime(): number {

        return (

            Date.now() -

            this.startedAt.getTime()

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const shutdown =

    new ShutdownManager();
```

