/**
==========================================================
AURA Trade OS
Cron Scheduler
Version : 0.3.0 Alpha
==========================================================
Cron-based Scheduler
==========================================================
*/

export interface CronJob {

    readonly id: string;

    readonly expression: string;

    readonly callback:

        () => Promise<void> | void;

}





export class CronScheduler {

    private readonly jobs =

        new Map<string, CronJob>();





    /*
    ======================================================
    Register
    ======================================================
    */

    public register(

        job: CronJob,

    ): void {

        this.jobs.set(

            job.id,

            job,

        );

    }





    /*
    ======================================================
    Remove
    ======================================================
    */

    public remove(

        id: string,

    ): void {

        this.jobs.delete(

            id,

        );

    }





    /*
    ======================================================
    Get
    ======================================================
    */

    public get(

        id: string,

    ): CronJob | undefined {

        return this.jobs.get(

            id,

        );

    }





    /*
    ======================================================
    List
    ======================================================
    */

    public list():

        readonly CronJob[] {

        return [

            ...this.jobs.values(),

        ];

    }

}





export const cronScheduler =

    new CronScheduler();


