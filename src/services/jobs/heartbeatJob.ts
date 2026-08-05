/**
==========================================================
AURA Trade OS
Heartbeat Job
Version : 0.2.0 Alpha
==========================================================
Scheduled Heartbeat Job
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Heartbeat Job
==========================================================
*/

export class HeartbeatJob {

    private running =

        false;



    private lastHeartbeat =

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

                "Heartbeat job already running.",

            );



            return;

        }



        this.running =

            true;



        try {

            this.lastHeartbeat =

                new Date();



            logger.debug(

                `Heartbeat: ${this.lastHeartbeat.toISOString()}`,

            );

        }

        catch (error) {

            logger.error(

                "Heartbeat job failed.",

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
    Last Heartbeat
    ======================================================
    */

    public getLastHeartbeat():

        Date {

        return this.lastHeartbeat;

    }





    /*
    ======================================================
    Age
    ======================================================
    */

    public age():

        number {

        return (

            Date.now() -

            this.lastHeartbeat.getTime()

        );

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

export const heartbeatJob =

    new HeartbeatJob();
```

