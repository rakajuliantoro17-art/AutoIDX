/**
==========================================================
AURA Trade OS
Scheduler Recovery
Version : 0.3.0 Alpha
==========================================================
Scheduler Recovery Engine
==========================================================
*/

export type SchedulerRecoveryAction =

    | "retry"

    | "skip"

    | "abort";





export interface SchedulerRecoveryPlan {

    readonly action:

        SchedulerRecoveryAction;





    readonly reason: string;





    readonly retryAfter?: number;

}





export interface SchedulerExecutionFailure {

    readonly jobId: string;

    readonly error: Error;

    readonly attempts: number;

}





export class SchedulerRecovery {

    /*
    ======================================================
    Create Recovery Plan
    ======================================================
    */

    public recover(

        failure:

        SchedulerExecutionFailure,

    ): SchedulerRecoveryPlan {

        if (

            failure.attempts < 3

        ) {

            return {

                action: "retry",

                retryAfter: 1000,

                reason:

                    "Retry limit not reached.",

            };

        }



        return {

            action: "abort",

            reason:

                "Maximum retry exceeded.",

        };

    }

}





export const schedulerRecovery =

    new SchedulerRecovery();


