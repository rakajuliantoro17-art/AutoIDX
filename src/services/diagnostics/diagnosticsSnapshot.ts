/**
==========================================================
AURA Trade OS
Diagnostics Snapshot
Version : 0.3.0 Alpha
==========================================================
Diagnostics Snapshot Model
==========================================================
*/





/*
==========================================================
Application
==========================================================
*/

export interface ApplicationSnapshot {

    uptimeSeconds: number;

    version: string;

    environment: string;

}





/*
==========================================================
Process
==========================================================
*/

export interface ProcessSnapshot {

    cpuUsage: number;

    memoryUsage: number;

    heapUsed: number;

    heapTotal: number;

}





/*
==========================================================
Scheduler
==========================================================
*/

export interface SchedulerSnapshot {

    activeJobs: number;

    completedJobs: number;

    failedJobs: number;

}





/*
==========================================================
Health
==========================================================
*/

export interface HealthSnapshot {

    healthy: boolean;

    warningCount: number;

    errorCount: number;

}





/*
==========================================================
Diagnostics Snapshot
==========================================================
*/

export interface DiagnosticsSnapshot {

    application:

        ApplicationSnapshot;

    process:

        ProcessSnapshot;

    scheduler:

        SchedulerSnapshot;

    health:

        HealthSnapshot;

    timestamp: Date;

}

