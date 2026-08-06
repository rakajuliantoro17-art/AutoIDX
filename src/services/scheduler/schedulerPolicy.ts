/**
==========================================================
AURA Trade OS
Scheduler Policy
Version : 0.3.0 Alpha
==========================================================
Scheduler Execution Policy
==========================================================
*/

export type SchedulerConcurrencyPolicy =

    | "allow"

    | "skip"

    | "queue";





export type SchedulerOverflowPolicy =

    | "reject"

    | "drop-oldest"

    | "drop-newest"

    | "expand";





export interface SchedulerRetryPolicy {

    readonly enabled: boolean;

    readonly maxAttempts: number;

    readonly delay: number;

}





export interface SchedulerPolicy {

    /*
    ======================================================
    Execution
    ======================================================
    */

    readonly concurrency:

        SchedulerConcurrencyPolicy;





    readonly timeout: number;





    /*
    ======================================================
    Retry
    ======================================================
    */

    readonly retry:

        SchedulerRetryPolicy;





    /*
    ======================================================
    Queue
    ======================================================
    */

    readonly overflow:

        SchedulerOverflowPolicy;

}

