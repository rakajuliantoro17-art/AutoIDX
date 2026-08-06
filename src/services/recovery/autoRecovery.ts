/**
==========================================================
AURA Trade OS
Auto Recovery Service
Version : 0.1.0 Alpha
==========================================================
Automatic Recovery Engine
==========================================================
*/

import { logger } from "@/services/logger";
import { cleanupService } from "@/services/maintenance/cleanup";
import { optimizationService } from "@/services/maintenance/optimize";





/*
==========================================================
Types
==========================================================
*/

export type RecoveryReason =

    | "MEMORY"

    | "CACHE"

    | "DATABASE"

    | "EXCHANGE"

    | "SCHEDULER"

    | "NETWORK"

    | "UNKNOWN";





export interface RecoveryResult {

    success: boolean;

    reason: RecoveryReason;

    startedAt: number;

    finishedAt: number;

    duration: number;

    actions: string[];

}





/*
==========================================================
Auto Recovery
==========================================================
*/

export class AutoRecovery {

    /*
    ======================================================
    Execute
    ======================================================
    */

    public execute(

        reason: RecoveryReason,

    ): RecoveryResult {

        const started = Date.now();

        const actions: string[] = [];



        logger.warn(

            `Recovery started: ${reason}`,

        );



        switch (reason) {

            case "CACHE":

                cleanupService.execute();

                actions.push(

                    "Cache cleaned",

                );

                break;



            case "MEMORY":

                optimizationService.execute();

                cleanupService.execute();

                actions.push(

                    "Memory optimized",

                );

                actions.push(

                    "Cache cleaned",

                );

                break;



            case "DATABASE":

                actions.push(

                    "Database reconnect requested",

                );

                break;



            case "EXCHANGE":

                actions.push(

                    "Exchange reconnect requested",

                );

                break;



            case "SCHEDULER":

                actions.push(

                    "Scheduler reset requested",

                );

                break;



            case "NETWORK":

                actions.push(

                    "Network reconnect requested",

                );

                break;



            default:

                cleanupService.execute();

                actions.push(

                    "General cleanup",

                );

                break;

        }



        const finished = Date.now();



        logger.info(

            "Recovery completed.",

            {

                reason,

                actions,

            },

        );



        return {

            success: true,

            reason,

            startedAt: started,

            finishedAt: finished,

            duration:

                finished - started,

            actions,

        };

    }





    /*
    ======================================================
    Memory Recovery
    ======================================================
    */

    public recoverMemory()

        : RecoveryResult {

        return this.execute(

            "MEMORY",

        );

    }





    /*
    ======================================================
    Cache Recovery
    ======================================================
    */

    public recoverCache()

        : RecoveryResult {

        return this.execute(

            "CACHE",

        );

    }





    /*
    ======================================================
    Exchange Recovery
    ======================================================
    */

    public recoverExchange()

        : RecoveryResult {

        return this.execute(

            "EXCHANGE",

        );

    }





    /*
    ======================================================
    Database Recovery
    ======================================================
    */

    public recoverDatabase()

        : RecoveryResult {

        return this.execute(

            "DATABASE",

        );

    }





    /*
    ======================================================
    Scheduler Recovery
    ======================================================
    */

    public recoverScheduler()

        : RecoveryResult {

        return this.execute(

            "SCHEDULER",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const autoRecovery =

    new AutoRecovery();

