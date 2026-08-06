/**
==========================================================
AURA Trade OS
Metrics Job
Version : 0.2.0 Alpha
==========================================================
Scheduled Metrics Collection Job
==========================================================
*/

import { logger } from "@/services/logger";

import {

    analyticsEngine,

} from "@/services/analytics/analyticsEngine";





/*
==========================================================
Metrics Job
==========================================================
*/

export class MetricsJob {

    private running =

        false;



    private lastExecution =

        new Date();





    /*
    ======================================================
    Execute
    ======================================================
    */

    public async execute():

        Promise<void> {

        if (

            this.running

        ) {

            logger.warn(

                "Metrics job already running.",

            );



            return;

        }



        this.running =

            true;



        logger.debug(

            "Metrics collection started.",

        );



        try {

            this.lastExecution =

                new Date();



            analyticsEngine.record(

                "metrics.collection",

                {

                    timestamp:

                        this.lastExecution.toISOString(),

                    uptime:

                        process.uptime(),

                    memory:

                        process.memoryUsage(),

                },

            );



            logger.debug(

                "Metrics collection completed.",

            );

        }

        catch (error) {

            logger.error(

                "Metrics collection failed.",

                error,

            );

        }

        finally {

            this.running =

                false;

        }

    }





    /*
    ======================================================
    Last Execution
    ======================================================
    */

    public getLastExecution():

        Date {

        return this.lastExecution;

    }





    /*
    ======================================================
    Running
    ======================================================
    */

    public isRunning():

        boolean {

        return this.running;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const metricsJob =

    new MetricsJob();

