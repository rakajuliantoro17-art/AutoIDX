/**
==========================================================
AURA Trade OS
Scheduler Statistics
Version : 0.3.0 Alpha
==========================================================
Scheduler Statistics Definition
==========================================================
*/

export interface SchedulerStatistics {

    /*
    ======================================================
    Execution
    ======================================================
    */

    readonly totalExecutions: number;

    readonly successfulExecutions: number;

    readonly failedExecutions: number;





    /*
    ======================================================
    Timing
    ======================================================
    */

    readonly averageExecutionTime: number;

    readonly longestExecutionTime: number;

    readonly shortestExecutionTime: number;





    /*
    ======================================================
    Scheduler
    ======================================================
    */

    readonly activeJobs: number;

    readonly queuedJobs: number;





    /*
    ======================================================
    Timestamp
    ======================================================
    */

    readonly updatedAt: Date;

}


