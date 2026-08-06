/**
==========================================================
AURA Trade OS
Optimization Job
Version : 0.2.0 Alpha
==========================================================
Scheduled Optimization Job
==========================================================
*/

import { logger } from "@/services/logger";

import {

    optimize,

} from "@/services/maintenance/optimize";





/*
==========================================================
Optimization Job
==========================================================
*/

export class OptimizationJob {

    private running =

        false;



    private lastExecution?:

        Date;





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

                "Optimization job already running.",

            );



            return;

        }



        this.running =

            true;



        logger.info(

            "Optimization job started.",

        );



        try {

            await optimize.run();



            this.lastExecution =

                new Date();



            logger.info(

                "Optimization job completed.",

            );

        }

        catch (error) {

            logger.error(

                "Optimization job failed.",

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
    Running
    ======================================================
    */

    public isRunning():

        boolean {

        return this.running;

    }





    /*
    ======================================================
    Last Execution
    ======================================================
    */

    public getLastExecution():

        Date | undefined {

        return this.lastExecution;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const optimizationJob =

    new OptimizationJob();

