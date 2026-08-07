/**
==========================================================
AURA Trade OS
Application
Version : 0.2.0 Alpha
==========================================================
Application Bootstrap
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Application State
==========================================================
*/

export enum ApplicationState {

    CREATED = "CREATED",

    INITIALIZING = "INITIALIZING",

    RUNNING = "RUNNING",

    STOPPING = "STOPPING",

    STOPPED = "STOPPED",

}





/*
==========================================================
Application
==========================================================
*/

export class Application {

    private state =

        ApplicationState.CREATED;





    /*
    ======================================================
    Start
    ======================================================
    */

    public async start(): Promise<void> {

        if (

            this.state !==

            ApplicationState.CREATED

        ) {

            logger.warn(

                "Application already started.",

            );

            return;

        }



        this.state =

            ApplicationState.INITIALIZING;



        logger.info(

            "Starting AURA Trade OS...",

        );



        await this.initialize();



        this.state =

            ApplicationState.RUNNING;



        logger.info(

            "Application is running.",

        );

    }





    /*
    ======================================================
    Initialize
    ======================================================
    */

    private async initialize(): Promise<void> {

        /*
        ==================================================

        Phase 20

        Service Registry

        Dependency Container

        Health Manager

        Metrics

        Scheduler

        Monitor

        Recovery

        ==================================================
        */

        logger.info(

            "Initializing services...",

        );

    }





    /*
    ======================================================
    Stop
    ======================================================
    */

    public async stop(): Promise<void> {

        if (

            this.state !==

            ApplicationState.RUNNING

        ) {

            return;

        }



        this.state =

            ApplicationState.STOPPING;



        logger.info(

            "Stopping application...",

        );



        await this.shutdown();



        this.state =

            ApplicationState.STOPPED;



        logger.info(

            "Application stopped.",

        );

    }





    /*
    ======================================================
    Shutdown
    ======================================================
    */

    private async shutdown(): Promise<void> {

        /*
        ==================================================

        Phase 20

        Flush Logger

        Stop Scheduler

        Save State

        Close Exchange

        ==================================================
        */

        logger.info(

            "Shutting down services...",

        );

    }





    /*
    ======================================================
    Restart
    ======================================================
    */

    public async restart(): Promise<void> {

        logger.info(

            "Restarting application...",

        );



        await this.stop();

        await this.start();

    }





    /*
    ======================================================
    State
    ======================================================
    */

    public getState():

        ApplicationState {

        return this.state;

    }





    /*
    ======================================================
    Running
    ======================================================
    */

    public isRunning(): boolean {

        return (

            this.state ===

            ApplicationState.RUNNING

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const application =

    new Application();

