/**
==========================================================
AURA Trade OS
Scheduler Manager
Version : 0.3.0 Alpha
==========================================================
Scheduler Orchestrator
==========================================================
*/

import { CronScheduler } from "./cronScheduler";
import { SchedulerQueue } from "./schedulerQueue";
import { SchedulerRecovery } from "./schedulerRecovery";

export class SchedulerManager {

    constructor(

        private readonly cronScheduler =

            new CronScheduler(),

        private readonly queue =

            new SchedulerQueue(),

        private readonly recovery =

            new SchedulerRecovery(),

    ) {}

    /*
    ======================================================
    Start
    ======================================================
    */

    public start(): void {

        // initialize scheduler

    }

    /*
    ======================================================
    Stop
    ======================================================
    */

    public stop(): void {

        // graceful shutdown

    }

    /*
    ======================================================
    Register
    ======================================================
    */

    public register(

        job: Parameters<CronScheduler["register"]>[0],

    ): void {

        this.cronScheduler.register(

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

        this.cronScheduler.remove(

            id,

        );

    }

    /*
    ======================================================
    Jobs
    ======================================================
    */

    public jobs() {

        return this.cronScheduler.list();

    }

}

export const schedulerManager =

    new SchedulerManager();

