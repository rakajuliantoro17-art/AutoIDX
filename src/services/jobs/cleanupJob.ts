/**
==========================================================
AURA Trade OS
Cleanup Job
Version : 0.2.0 Alpha
==========================================================
Scheduled Cleanup Job
==========================================================
*/

import { logger } from "@/services/logger";

import {

    cleanup,

} from "@/services/maintenance/cleanup";





/*
==========================================================
Cleanup Job
==========================================================
*/

export class CleanupJob {

    private running =

        false;





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

                "Cleanup job already running.",

            );

            return;

        }



        this.running =

            true;



        logger.info(

            "Cleanup job started.",

        );



        try {

            await cleanup.run();



            logger.info(

                "Cleanup job completed.",

            );

        }

        catch (error) {

            logger.error(

                "Cleanup job failed.",

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

}





/*
==========================================================
Singleton
==========================================================
*/

export const cleanupJob =

    new CleanupJob();
```

