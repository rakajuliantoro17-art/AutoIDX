/**
==========================================================
AURA Trade OS
Scheduler Metrics
Version : 0.2.0 Alpha
==========================================================
Scheduler Runtime Metrics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface SchedulerMetricsSnapshot {

    totalJobs: number;

    completedJobs: number;

    failedJobs: number;

    averageExecutionMS: number;

    lastExecutionMS: number;

    lastJobName?: string;

    lastExecutedAt?: Date;

}





/*
==========================================================
Scheduler Metrics
==========================================================
*/

export class SchedulerMetrics {

    private totalJobs = 0;

    private completedJobs = 0;

    private failedJobs = 0;

    private totalExecutionMS = 0;

    private lastExecutionMS = 0;

    private lastJobName?: string;

    private lastExecutedAt?: Date;





    /*
    ======================================================
    Success
    ======================================================
    */

    public recordSuccess(

        jobName: string,

        durationMS: number,

    ): void {

        this.totalJobs++;

        this.completedJobs++;

        this.totalExecutionMS +=

            durationMS;

        this.lastExecutionMS =

            durationMS;

        this.lastJobName =

            jobName;

        this.lastExecutedAt =

            new Date();

    }





    /*
    ======================================================
    Failure
    ======================================================
    */

    public recordFailure(

        jobName: string,

        durationMS: number,

    ): void {

        this.totalJobs++;

        this.failedJobs++;

        this.totalExecutionMS +=

            durationMS;

        this.lastExecutionMS =

            durationMS;

        this.lastJobName =

            jobName;

        this.lastExecutedAt =

            new Date();

    }





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        SchedulerMetricsSnapshot {

        const snapshot = {

            totalJobs:

                this.totalJobs,

            completedJobs:

                this.completedJobs,

            failedJobs:

                this.failedJobs,

            averageExecutionMS:

                this.totalJobs === 0

                    ? 0

                    : Number(

                        (

                            this.totalExecutionMS /

                            this.totalJobs

                        ).toFixed(2),

                    ),

            lastExecutionMS:

                this.lastExecutionMS,

            lastJobName:

                this.lastJobName,

            lastExecutedAt:

                this.lastExecutedAt,

        };



        logger.debug(

            "Scheduler metrics collected.",

        );



        return snapshot;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): void {

        this.totalJobs = 0;

        this.completedJobs = 0;

        this.failedJobs = 0;

        this.totalExecutionMS = 0;

        this.lastExecutionMS = 0;

        this.lastJobName =

            undefined;

        this.lastExecutedAt =

            undefined;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const schedulerMetrics =

    new SchedulerMetrics();
```

