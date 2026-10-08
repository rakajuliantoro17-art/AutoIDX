/**
==========================================================
AURA Trade OS
Report Job
Version : 0.2.0 Alpha
==========================================================
Scheduled Report Generation Job
==========================================================
*/

import logger from "@/services/logger";

import {

    healthReport,

} from "@/services/health/healthReport";





/*
==========================================================
Report Job
==========================================================
*/

export class ReportJob {

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

                "Report job already running.",

            );



            return;

        }



        this.running =

            true;



        logger.info(

            "Report generation started.",

        );



        try {

            const report =

                await healthReport.generate();



            logger.info(

                `Report generated (${report.overallStatus}).`,

            );



            this.lastExecution =

                new Date();



            /*
            ==============================================

            TODO

            Save report

            Upload report

            Email report

            Archive report

            ==============================================
            */

        }

        catch (error) {

            logger.error(

                "Report generation failed.",

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

export const reportJob =

    new ReportJob();

