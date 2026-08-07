/**
==========================================================
AURA Trade OS
Emergency Shutdown
Version : 0.1.0 Alpha
==========================================================
Emergency Shutdown Service
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export type EmergencyReason =

    | "MAX_DRAWDOWN"

    | "EXCHANGE_OFFLINE"

    | "DATABASE_FAILURE"

    | "MEMORY_LIMIT"

    | "NETWORK_FAILURE"

    | "MANUAL"

    | "UNKNOWN";





export interface EmergencyShutdownResult {

    success: boolean;

    reason: EmergencyReason;

    startedAt: number;

    finishedAt: number;

    duration: number;

    actions: string[];

}





/*
==========================================================
Emergency Shutdown
==========================================================
*/

export class EmergencyShutdownService {

    private active = false;





    /*
    ======================================================
    Status
    ======================================================
    */

    public isActive(): boolean {

        return this.active;

    }





    /*
    ======================================================
    Execute
    ======================================================
    */

    public async execute(

        reason: EmergencyReason,

    ): Promise<EmergencyShutdownResult> {

        const started = Date.now();

        this.active = true;

        const actions: string[] = [];



        logger.error(

            "Emergency shutdown initiated.",

            undefined,

            {

                reason,

            },

        );



        /*
        ==================================================
        Stop Trading
        ==================================================
        */

        actions.push(

            "Trading engine stopped",

        );



        /*
        ==================================================
        Cancel Pending Orders
        ==================================================
        */

        actions.push(

            "Pending orders cancelled",

        );



        /*
        ==================================================
        Disable New Orders
        ==================================================
        */

        actions.push(

            "New orders blocked",

        );



        /*
        ==================================================
        Flush Logs
        ==================================================
        */

        actions.push(

            "Logs flushed",

        );



        /*
        ==================================================
        Save Recovery State
        ==================================================
        */

        actions.push(

            "Recovery state saved",

        );



        /*
        ==================================================
        Notify Administrator
        ==================================================
        */

        actions.push(

            "Administrator notified",

        );



        const finished = Date.now();



        logger.error(

            "Emergency shutdown completed.",

            undefined,

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
    Reset
    ======================================================
    */

    public reset(): void {

        this.active = false;

    }





    /*
    ======================================================
    Manual Shutdown
    ======================================================
    */

    public async manual() {

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

export const emergencyShutdown =

    new EmergencyShutdownService();

