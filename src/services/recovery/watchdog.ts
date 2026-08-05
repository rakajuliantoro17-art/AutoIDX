/**
==========================================================
AURA Trade OS
Watchdog
Version : 0.1.0 Alpha
==========================================================
System Watchdog Service
==========================================================
*/

import { logger } from "@/services/logger";

import { autoRecovery } from "./autoRecovery";

import { emergencyShutdown } from "./emergencyShutdown";





/*
==========================================================
Types
==========================================================
*/

export type WatchdogStatus =

    | "HEALTHY"

    | "WARNING"

    | "CRITICAL";





export interface WatchdogReport {

    status: WatchdogStatus;

    reason?: string;

    checkedAt: number;

}





/*
==========================================================
Watchdog
==========================================================
*/

export class Watchdog {

    private enabled = true;





    /*
    ======================================================
    Enable
    ======================================================
    */

    public enable(): void {

        this.enabled = true;

    }





    /*
    ======================================================
    Disable
    ======================================================
    */

    public disable(): void {

        this.enabled = false;

    }





    /*
    ======================================================
    Status
    ======================================================
    */

    public isEnabled(): boolean {

        return this.enabled;

    }





    /*
    ======================================================
    Check
    ======================================================
    */

    public async check(

        report: WatchdogReport,

    ): Promise<void> {

        if (!this.enabled) {

            return;

        }



        logger.info(

            "Watchdog check.",

            report,

        );



        switch (report.status) {

            case "HEALTHY":

                return;



            case "WARNING":

                logger.warn(

                    "Watchdog warning.",

                    report,

                );



                autoRecovery.execute(

                    "UNKNOWN",

                );



                return;



            case "CRITICAL":

                logger.error(

                    "Watchdog critical.",

                    undefined,

                    report,

                );



                await emergencyShutdown.execute(

                    "UNKNOWN",

                );



                return;

        }

    }





    /*
    ======================================================
    Memory Warning
    ======================================================
    */

    public async memoryWarning(): Promise<void> {

        await this.check({

            status: "WARNING",

            reason: "Memory usage exceeded threshold.",

            checkedAt: Date.now(),

        });

    }





    /*
    ======================================================
    Exchange Failure
    ======================================================
    */

    public async exchangeFailure(): Promise<void> {

        await this.check({

            status: "WARNING",

            reason: "Exchange unavailable.",

            checkedAt: Date.now(),

        });

    }





    /*
    ======================================================
    Scheduler Failure
    ======================================================
    */

    public async schedulerFailure(): Promise<void> {

        await this.check({

            status: "WARNING",

            reason: "Scheduler execution failed.",

            checkedAt: Date.now(),

        });

    }





    /*
    ======================================================
    Critical Failure
    ======================================================
    */

    public async critical(

        reason: string,

    ): Promise<void> {

        await this.check({

            status: "CRITICAL",

            reason,

            checkedAt: Date.now(),

        });

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const watchdog =

    new Watchdog();
```

