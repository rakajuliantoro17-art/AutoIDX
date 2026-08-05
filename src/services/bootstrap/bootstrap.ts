/**
==========================================================
AURA Trade OS
Bootstrap
Version : 0.2.0 Alpha
==========================================================
Bootstrap Coordinator
==========================================================
*/

import { logger } from "@/services/logger";

import {

    application,

} from "./application";





/*
==========================================================
Bootstrap
==========================================================
*/

export class Bootstrap {

    private initialized =

        false;





    /*
    ======================================================
    Initialize
    ======================================================
    */

    public async initialize(): Promise<void> {

        if (

            this.initialized

        ) {

            logger.warn(

                "Bootstrap already initialized.",

            );



            return;

        }



        logger.info(

            "Bootstrap initialization started.",

        );



        await this.beforeStart();



        await application.start();



        await this.afterStart();



        this.initialized =

            true;



        logger.info(

            "Bootstrap completed.",

        );

    }





    /*
    ======================================================
    Before Start
    ======================================================
    */

    private async beforeStart(): Promise<void> {

        logger.info(

            "Preparing application startup...",

        );



        /*
        ==================================================

        Future Initialization

        - Load Configuration

        - Validate Environment

        - Register Services

        - Initialize Logger

        - Initialize Health Manager

        ==================================================
        */

    }





    /*
    ======================================================
    After Start
    ======================================================
    */

    private async afterStart(): Promise<void> {

        logger.info(

            "Running post-start tasks...",

        );



        /*
        ==================================================

        Future Tasks

        - Start Scheduler

        - Start Monitoring

        - Start Metrics

        - Start Recovery

        ==================================================
        */

    }





    /*
    ======================================================
    Shutdown
    ======================================================
    */

    public async shutdown(): Promise<void> {

        logger.info(

            "Bootstrap shutdown started.",

        );



        await application.stop();



        this.initialized =

            false;



        logger.info(

            "Bootstrap shutdown completed.",

        );

    }





    /*
    ======================================================
    Restart
    ======================================================
    */

    public async restart(): Promise<void> {

        logger.info(

            "Restarting bootstrap...",

        );



        await this.shutdown();

        await this.initialize();

    }





    /*
    ======================================================
    Status
    ======================================================
    */

    public isInitialized(): boolean {

        return this.initialized;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const bootstrap =

    new Bootstrap();
```

