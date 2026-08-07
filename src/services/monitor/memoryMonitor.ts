/**
==========================================================
AURA Trade OS
Memory Monitor
Version : 0.1.0 Alpha
==========================================================
Memory Monitoring Service
==========================================================
*/

import logger from "@/services/logger";



/*
==========================================================
Types
==========================================================
*/

export interface MemorySnapshot {

    rss: number;

    heapTotal: number;

    heapUsed: number;

    external: number;

    arrayBuffers: number;

    timestamp: number;

}



export interface MemoryStatistics {

    current: MemorySnapshot;

    averageHeapUsed: number;

    maximumHeapUsed: number;

    minimumHeapUsed: number;

    samples: number;

}





/*
==========================================================
Memory Monitor
==========================================================
*/

export class MemoryMonitor {

    private readonly history:

        MemorySnapshot[] = [];

    private readonly maxSamples = 300;





    /*
    ======================================================
    Convert
    ======================================================
    */

    private toMB(

        bytes: number,

    ): number {

        return Number(

            (

                bytes /

                1024 /

                1024

            ).toFixed(2),

        );

    }





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        MemorySnapshot {

        const memory =

            process.memoryUsage();

        const snapshot: MemorySnapshot = {

            rss:

                this.toMB(

                    memory.rss,

                ),

            heapTotal:

                this.toMB(

                    memory.heapTotal,

                ),

            heapUsed:

                this.toMB(

                    memory.heapUsed,

                ),

            external:

                this.toMB(

                    memory.external,

                ),

            arrayBuffers:

                this.toMB(

                    memory.arrayBuffers,

                ),

            timestamp:

                Date.now(),

        };

        this.history.push(snapshot);

        if (

            this.history.length >

            this.maxSamples

        ) {

            this.history.shift();

        }

        logger.debug(

            "Memory snapshot recorded.",

            {

                heapUsed:

                    snapshot.heapUsed,

                rss:

                    snapshot.rss,

            },

        );

        return snapshot;

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public statistics():

        MemoryStatistics {

        const current =

            this.snapshot();

        const heaps =

            this.history.map(

                item =>

                    item.heapUsed,

            );

        const total =

            heaps.reduce(

                (sum, value) =>

                    sum + value,

                0,

            );

        return {

            current,

            averageHeapUsed:

                Number(

                    (

                        total /

                        heaps.length

                    ).toFixed(2),

                ),

            maximumHeapUsed:

                Math.max(

                    ...heaps,

                ),

            minimumHeapUsed:

                Math.min(

                    ...heaps,

                ),

            samples:

                heaps.length,

        };

    }





    /*
    ======================================================
    History
    ======================================================
    */

    public getHistory():

        MemorySnapshot[] {

        return [

            ...this.history,

        ];

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.history.length = 0;

    }





    /*
    ======================================================
    Threshold
    ======================================================
    */

    public exceeds(

        limitMB: number,

    ): boolean {

        const current =

            this.snapshot();

        return (

            current.heapUsed >=

            limitMB

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const memoryMonitor =

    new MemoryMonitor();

