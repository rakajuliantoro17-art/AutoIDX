/**
==========================================================
AURA Trade OS
Cleanup Service
Version : 0.1.0 Alpha
==========================================================
System Maintenance Cleanup
==========================================================
*/

import { marketCache } from "@/services/cache/marketCache";

import { orderCache } from "@/services/cache/orderCache";

import { strategyCache } from "@/services/cache/strategyCache";

import { logRotation } from "@/services/logger/logRotation";





/*
==========================================================
Types
==========================================================
*/

export interface CleanupResult {

    timestamp: number;

    cache: {

        market: number;

        order: number;

        strategy: number;

    };

    logs: {

        rotated: boolean;

    };

    duration: number;

}





/*
==========================================================
Cleanup Service
==========================================================
*/

export class CleanupService {

    /*
    ======================================================
    Execute
    ======================================================
    */

    public execute(): CleanupResult {

        const started = Date.now();





        /*
        ==================================================
        Cache
        ==================================================
        */

        const market =

            marketCache.cleanup();

        const order =

            orderCache.cleanup();

        const strategy =

            strategyCache.cleanup();





        /*
        ==================================================
        Log Rotation
        ==================================================
        */

        const rotated =

            logRotation.rotate();





        /*
        ==================================================
        Result
        ==================================================
        */

        return {

            timestamp: Date.now(),

            cache: {

                market,

                order,

                strategy,

            },

            logs: {

                rotated,

            },

            duration:

                Date.now() - started,

        };

    }





    /*
    ======================================================
    Daily Maintenance
    ======================================================
    */

    public daily(): CleanupResult {

        return this.execute();

    }





    /*
    ======================================================
    Manual Maintenance
    ======================================================
    */

    public manual(): CleanupResult {

        return this.execute();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const cleanupService =

    new CleanupService();

