/**
==========================================================
AURA Trade OS
Scheduler Health Check
Version : 0.2.0 Alpha
==========================================================
Scheduler Health Monitoring
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type SchedulerHealthStatus =

    "HEALTHY" |

    "WARNING" |

    "UNHEALTHY";





export interface SchedulerHealthReport {

    status: SchedulerHealthStatus;

    running: boolean;

    lastExecution?: Date;

    message: string;

    checkedAt: Date;

}





/*
==========================================================
Scheduler Health
==========================================================
*/

export class SchedulerHealth {

    private running = true;

    private lastExecution =

        new Date();





    /*
    ======================================================
    Check
    ======================================================
    */

    public check():

        SchedulerHealthReport {

        try {

            const now =

                Date.now();



            const diff =

                now -

                this.lastExecution.getTime();



            const status =

                this.resolveStatus(

                    diff,

                );



            return {

                status,

                running:

                    this.running,

                lastExecution:

                    this.lastExecution,

                message:

                    this.message(

                        status,

                    ),

                checkedAt:

                    new Date(),

            };

        }

        catch (error) {

            logger.error(

                "Scheduler health check failed.",

                error,

            );



            return {

                status:

                    "UNHEALTHY",

                running: false,

                message:

                    "Scheduler unavailable.",

                checkedAt:

                    new Date(),

            };

        }

    }





    /*
    ======================================================
    Update Execution
    ======================================================
    */

    public updateExecution():

        void {

        this.lastExecution =

            new Date();

    }





    /*
    ======================================================
    Set Running
    ======================================================
    */

    public setRunning(

        running: boolean,

    ): void {

        this.running =

            running;

    }





    /*
    ======================================================
    Healthy
    ======================================================
    */

    public isHealthy():

        boolean {

        return (

            this.check()

                .status ===

            "HEALTHY"

        );

    }





    /*
    ======================================================
    Resolve Status
    ======================================================
    */

    private resolveStatus(

        elapsedMS: number,

    ): SchedulerHealthStatus {

        if (

            !this.running

        ) {

            return "UNHEALTHY";

        }



        if (

            elapsedMS <

            60_000

        ) {

            return "HEALTHY";

        }



        if (

            elapsedMS <

            300_000

        ) {

            return "WARNING";

        }



        return "UNHEALTHY";

    }





    /*
    ======================================================
    Message
    ======================================================
    */

    private message(

        status: SchedulerHealthStatus,

    ): string {

        switch (

            status

        ) {

            case "HEALTHY":

                return "Scheduler operating normally.";



            case "WARNING":

                return "Scheduler execution delayed.";



            default:

                return "Scheduler not responding.";

        }

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const schedulerHealth =

    new SchedulerHealth();

