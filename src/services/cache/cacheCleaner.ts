/**
==========================================================
AURA Trade OS
Cache Cleaner
Version : 0.3.0 Alpha
==========================================================
Cache Housekeeping Service
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface CacheCleanerResult {

    removed: number;

    durationMS: number;

    timestamp: Date;

}





/*
==========================================================
Cache Cleaner
==========================================================
*/

export class CacheCleaner {

    private lastCleanup?:

        CacheCleanerResult;





    /*
    ======================================================
    Cleanup
    ======================================================
    */

    public async cleanup():

        Promise<CacheCleanerResult> {

        const started =

            Date.now();



        /*
        ==============================================
        Future

        memoryCache.cleanup()

        persistentCache.cleanup()

        distributedCache.cleanup()

        ==============================================
        */

        const removed = 0;



        const result = {

            removed,

            durationMS:

                Date.now() -

                started,

            timestamp:

                new Date(),

        };



        this.lastCleanup =

            result;



        logger.info(

            "Cache cleanup completed.",

            result,

        );



        return result;

    }





    /*
    ======================================================
    Last Cleanup
    ======================================================
    */

    public getLastCleanup():

        CacheCleanerResult |

        undefined {

        return this.lastCleanup;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const cacheCleaner =

    new CacheCleaner();

