/**
==========================================================
AURA Trade OS
Kernel
Version : 0.2.0 Alpha
==========================================================
Application Kernel
==========================================================
*/

import { logger } from "@/services/logger";

import {

    application,

} from "@/services/bootstrap/application";

import {

    lifecycle,

} from "@/services/bootstrap/lifecycle";

import {

    serviceRegistry,

} from "@/services/bootstrap/serviceRegistry";

import {

    applicationContext,

} from "./applicationContext";

import {

    health,

} from "./health";





/*
==========================================================
Kernel State
==========================================================
*/

export enum KernelState {

    CREATED = "CREATED",

    BOOTING = "BOOTING",

    READY = "READY",

    STOPPING = "STOPPING",

    STOPPED = "STOPPED",

}





/*
==========================================================
Kernel
==========================================================
*/

export class Kernel {

    private state =

        KernelState.CREATED;





    /*
    ======================================================
    Boot
    ======================================================
    */

    public async boot(): Promise<void> {

        if (

            this.state !==

            KernelState.CREATED

        ) {

            logger.warn(

                "Kernel already initialized.",

            );



            return;

        }



        this.state =

            KernelState.BOOTING;



        logger.info(

            "Booting AURA Kernel...",

        );



        serviceRegistry.registerAll();



        await application.start();



        lifecycle.start();



        health.healthy();



        this.state =

            KernelState.READY;



        logger.info(

            "Kernel is ready.",

        );

    }





    /*
    ======================================================
    Shutdown
    ======================================================
    */

    public async shutdown(): Promise<void> {

        if (

            this.state !==

            KernelState.READY

        ) {

            return;

        }



        this.state =

            KernelState.STOPPING;



        logger.info(

            "Kernel shutdown initiated.",

        );



        lifecycle.stop();



        await application.stop();



        this.state =

            KernelState.STOPPED;



        logger.info(

            "Kernel stopped.",

        );

    }





    /*
    ======================================================
    Restart
    ======================================================
    */

    public async restart(): Promise<void> {

        logger.info(

            "Restarting kernel...",

        );



        await this.shutdown();



        this.state =

            KernelState.CREATED;



        await this.boot();

    }





    /*
    ======================================================
    Ready
    ======================================================
    */

    public isReady(): boolean {

        return (

            this.state ===

            KernelState.READY

        );

    }





    /*
    ======================================================
    State
    ======================================================
    */

    public getState():

        KernelState {

        return this.state;

    }





    /*
    ======================================================
    Information
    ======================================================
    */

    public getInformation() {

        return {

            kernel:

                this.state,

            application:

                applicationContext.getSummary(),

            health:

                health.getInformation(),

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const kernel =

    new Kernel();

