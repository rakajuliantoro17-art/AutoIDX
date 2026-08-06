/**
==========================================================
AURA Trade OS
Cache Metrics
Version : 0.3.0 Alpha
==========================================================
Cache Runtime Metrics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface CacheMetricsSnapshot {

    hits: number;

    misses: number;

    writes: number;

    deletes: number;

    evictions: number;

    hitRatio: number;

    totalOperations: number;

    lastOperationAt?: Date;

}





/*
==========================================================
Cache Metrics
==========================================================
*/

export class CacheMetrics {

    private hits = 0;

    private misses = 0;

    private writes = 0;

    private deletes = 0;

    private evictions = 0;

    private lastOperationAt?: Date;





    /*
    ======================================================
    Hit
    ======================================================
    */

    public recordHit(): void {

        this.hits++;

        this.lastOperationAt =

            new Date();

    }





    /*
    ======================================================
    Miss
    ======================================================
    */

    public recordMiss(): void {

        this.misses++;

        this.lastOperationAt =

            new Date();

    }





    /*
    ======================================================
    Write
    ======================================================
    */

    public recordWrite(): void {

        this.writes++;

        this.lastOperationAt =

            new Date();

    }





    /*
    ======================================================
    Delete
    ======================================================
    */

    public recordDelete(): void {

        this.deletes++;

        this.lastOperationAt =

            new Date();

    }





    /*
    ======================================================
    Eviction
    ======================================================
    */

    public recordEviction(): void {

        this.evictions++;

        this.lastOperationAt =

            new Date();

    }





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        CacheMetricsSnapshot {

        const totalReads =

            this.hits +

            this.misses;



        const totalOperations =

            totalReads +

            this.writes +

            this.deletes +

            this.evictions;



        const snapshot = {

            hits:

                this.hits,

            misses:

                this.misses,

            writes:

                this.writes,

            deletes:

                this.deletes,

            evictions:

                this.evictions,

            hitRatio:

                totalReads === 0

                    ? 0

                    : Number(

                        (

                            (this.hits /

                                totalReads) *

                            100

                        ).toFixed(2),

                    ),

            totalOperations,

            lastOperationAt:

                this.lastOperationAt,

        };



        logger.debug(

            "Cache metrics collected.",

        );



        return snapshot;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): void {

        this.hits = 0;

        this.misses = 0;

        this.writes = 0;

        this.deletes = 0;

        this.evictions = 0;

        this.lastOperationAt =

            undefined;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const cacheMetrics =

    new CacheMetrics();

