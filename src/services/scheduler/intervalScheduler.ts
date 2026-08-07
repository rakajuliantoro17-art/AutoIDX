/**
==========================================================
AURA Trade OS
Interval Scheduler
Version : 0.3.0 Alpha
==========================================================
Fixed Interval Scheduler
==========================================================
*/

export interface IntervalJob {

    readonly id: string;

    readonly interval: number;

    readonly callback:

        () => Promise<void> | void;

}





export class IntervalScheduler {

    private readonly jobs =

        new Map<string, IntervalJob>();



    private readonly timers =

        new Map<string, ReturnType<typeof setInterval>>();





    /*
    ======================================================
    Register
    ======================================================
    */

    public register(

        job: IntervalJob,

    ): void {

        this.jobs.set(

            job.id,

            job,

        );

    }





    /*
    ======================================================
    Start
    ======================================================
    */

    public start(

        id: string,

    ): void {

        const job =

            this.jobs.get(id);

        if (!job) {

            return;

        }



        if (

            this.timers.has(id)

        ) {

            return;

        }



        const timer =

            setInterval(

                () => {

                    void job.callback();

                },

                job.interval,

            );



        this.timers.set(

            id,

            timer,

        );

    }





    /*
    ======================================================
    Stop
    ======================================================
    */

    public stop(

        id: string,

    ): void {

        const timer =

            this.timers.get(id);

        if (!timer) {

            return;

        }



        clearInterval(timer);

        this.timers.delete(id);

    }





    /*
    ======================================================
    Remove
    ======================================================
    */

    public remove(

        id: string,

    ): void {

        this.stop(id);

        this.jobs.delete(id);

    }





    /*
    ======================================================
    List
    ======================================================
    */

    public list():

        readonly IntervalJob[] {

        return [

            ...this.jobs.values(),

        ];

    }

}





export const intervalScheduler =

    new IntervalScheduler();

