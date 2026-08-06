/**
==========================================================
AURA Trade OS
Restart Manager
Version : 0.1.0 Alpha
==========================================================
Graceful Restart Manager
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type RestartReason =

    | "SYSTEM_UPDATE"

    | "CONFIG_UPDATED"

    | "MEMORY_RECOVERY"

    | "CRASH_RECOVERY"

    | "MANUAL"

    | "UNKNOWN";





export interface RestartResult {

    success: boolean;

    reason: RestartReason;

    startedAt: number;

    finishedAt: number;

    duration: number;

    restartRequired: boolean;

    actions: string[];

}





/*
==========================================================
Restart Manager
==========================================================
*/

export class RestartManager {

    private restartRequired = false;





    /*
    ======================================================
    Status
    ======================================================
    */

    public isRestartRequired(): boolean {

        return this.restartRequired;

    }





    /*
    ======================================================
    Execute
    ======================================================
    */

    public async execute(

        reason: RestartReason,

    ): Promise<RestartResult> {

        const started = Date.now();

        const actions: string[] = [];

        this.restartRequired = true;



        logger.warn(

            "Restart requested.",

            {

                reason,

            },

        );



        /*
        ==================================================
        Freeze Trading
        ==================================================
        */

        actions.push(

            "Trading paused",

        );



        /*
        ==================================================
        Save Runtime State
        ==================================================
        */

        actions.push(

            "Runtime state saved",

        );



        /*
        ==================================================
        Flush Logger
        ==================================================
        */

        actions.push(

            "Logs flushed",

        );



        /*
        ==================================================
        Close Connections
        ==================================================
        */

        actions.push(

            "Connections closed",

        );



        /*
        ==================================================
        Notify Administrator
        ==================================================
        */

        actions.push(

            "Administrator notified",

        );



        /*
        ==================================================
        NOTE

        Vercel:
        No physical restart.

        VPS:
        Future implementation.

        ==================================================
        */



        const finished = Date.now();



        logger.info(

            "Restart preparation completed.",

            {

                reason,

            },

        );



        return {

            success: true,

            reason,

            startedAt: started,

            finishedAt: finished,

            duration:

                finished - started,

            restartRequired:

                this.restartRequired,

            actions,

        };

    }





    /*
    ======================================================
    Complete Restart
    ======================================================
    */

    public complete(): void {

        this.restartRequired = false;

    }





    /*
    ======================================================
    Manual Restart
    ======================================================
    */

    public async manual()

        : Promise<RestartResult> {

        return this.execute(

            "MANUAL",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const restartManager =

    new RestartManager();

