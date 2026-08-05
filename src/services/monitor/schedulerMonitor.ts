/**
==========================================================
AURA Trade OS
Scheduler Monitor
Version : 0.1.0 Alpha
==========================================================
Scheduler Monitoring Service
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type SchedulerStatus =

    | "IDLE"

    | "RUNNING"

    | "SUCCESS"

    | "FAILED"

    | "TIMEOUT";





export interface SchedulerSnapshot {

    job: string;

    status: SchedulerStatus;

    startedAt?: number;

    finishedAt?: number;

    durationMS?: number;

    message?: string;

}





/*
==========================================================
Scheduler Monitor
==========================================================
*/

export class SchedulerMonitor {

    private readonly jobs =

        new Map<

            string,

            SchedulerSnapshot

        >();





    /*
    ======================================================
    Start
    ======================================================
    */

    public start(

        job: string,

    ): void {

        this.jobs.set(

            job,

            {

                job,

                status: "RUNNING",

                startedAt: Date.now(),

            },

        );



        logger.info(

            `Scheduler started: ${job}`,

        );

    }





    /*
    ======================================================
    Success
    ======================================================
    */

    public success(

        job: string,

        message?: string,

    ): void {

        const current =

            this.jobs.get(job);

        if (!current) {

            return;

        }



        const finished = Date.now();



        this.jobs.set(

            job,

            {

                ...current,

                status: "SUCCESS",

                finishedAt: finished,

                durationMS:

                    finished -

                    (current.startedAt ??

                        finished),

                message,

            },

        );



        logger.info(

            `Scheduler completed: ${job}`,

            {

                duration:

                    finished -

                    (current.startedAt ??

                        finished),

            },

        );

    }





    /*
    ======================================================
    Failure
    ======================================================
    */

    public failed(

        job: string,

        error?: unknown,

    ): void {

        const current =

            this.jobs.get(job);



        const finished = Date.now();



        this.jobs.set(

            job,

            {

                ...current,

                job,

                status: "FAILED",

                finishedAt: finished,

                durationMS:

                    current?.startedAt

                        ? finished -

                          current.startedAt

                        : undefined,

                message:

                    error instanceof Error

                        ? error.message

                        : String(error),

            },

        );



        logger.error(

            `Scheduler failed: ${job}`,

            error,

        );

    }





    /*
    ======================================================
    Timeout
    ======================================================
    */

    public timeout(

        job: string,

    ): void {

        const current =

            this.jobs.get(job);



        this.jobs.set(

            job,

            {

                ...current,

                job,

                status: "TIMEOUT",

                finishedAt: Date.now(),

                durationMS:

                    current?.startedAt

                        ? Date.now() -

                          current.startedAt

                        : undefined,

            },

        );



        logger.warn(

            `Scheduler timeout: ${job}`,

        );

    }





    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        job: string,

    ): SchedulerSnapshot | undefined {

        return this.jobs.get(job);

    }





    /*
    ======================================================
    All
    ======================================================
    */

    public getAll():

        SchedulerSnapshot[] {

        return Array.from(

            this.jobs.values(),

        );

    }





    /*
    ======================================================
    Running
    ======================================================
    */

    public running():

        SchedulerSnapshot[] {

        return this.getAll()

            .filter(

                job =>

                    job.status ===

                    "RUNNING",

            );

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public statistics() {

        const jobs =

            this.getAll();



        return {

            total:

                jobs.length,

            running:

                jobs.filter(

                    job =>

                        job.status ===

                        "RUNNING",

                ).length,

            success:

                jobs.filter(

                    job =>

                        job.status ===

                        "SUCCESS",

                ).length,

            failed:

                jobs.filter(

                    job =>

                        job.status ===

                        "FAILED",

                ).length,

            timeout:

                jobs.filter(

                    job =>

                        job.status ===

                        "TIMEOUT",

                ).length,

        };

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.jobs.clear();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const schedulerMonitor =

    new SchedulerMonitor();
```

