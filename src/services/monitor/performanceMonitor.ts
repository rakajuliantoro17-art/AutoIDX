/**
==========================================================
AURA Trade OS
Performance Monitor
Version : 0.1.0 Alpha
==========================================================
Performance Monitoring Service
==========================================================
*/

import logger from "@/services/logger";

import { memoryMonitor } from "./memoryMonitor";



/*
==========================================================
Types
==========================================================
*/

export interface PerformanceSnapshot {

    cpuUsage: number;

    memoryUsageMB: number;

    uptimeSeconds: number;

    eventLoopDelayMS: number;

    timestamp: number;

}



export interface PerformanceStatistics {

    current: PerformanceSnapshot;

    averageMemoryMB: number;

    averageCPU: number;

    samples: number;

}





/*
==========================================================
Performance Monitor
==========================================================
*/

export class PerformanceMonitor {

    private readonly history:

        PerformanceSnapshot[] = [];



    private readonly maxSamples = 300;





    /*
    ======================================================
    CPU Usage
    ======================================================
    */

    private cpuUsage(): number {

        const usage =

            process.cpuUsage();

        return Number(

            (

                (usage.user + usage.system)

                / 1000

            ).toFixed(2),

        );

    }





    /*
    ======================================================
    Event Loop Delay
    ======================================================
    */

    private eventLoopDelay(): number {

        /*
        Placeholder.

        Phase 20:
        monitorEventLoopDelay()
        */

        return 0;

    }





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        PerformanceSnapshot {

        const memory =

            memoryMonitor.snapshot();

        const snapshot: PerformanceSnapshot = {

            cpuUsage:

                this.cpuUsage(),

            memoryUsageMB:

                memory.heapUsed,

            uptimeSeconds:

                Number(

                    process.uptime()

                        .toFixed(2),

                ),

            eventLoopDelayMS:

                this.eventLoopDelay(),

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

            "Performance snapshot.",

            snapshot,

        );



        return snapshot;

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public statistics():

        PerformanceStatistics {

        const current =

            this.snapshot();



        const memories =

            this.history.map(

                item =>

                    item.memoryUsageMB,

            );



        const cpus =

            this.history.map(

                item =>

                    item.cpuUsage,

            );



        const averageMemory =

            memories.reduce(

                (a, b) => a + b,

                0,

            ) /

            memories.length;



        const averageCPU =

            cpus.reduce(

                (a, b) => a + b,

                0,

            ) /

            cpus.length;



        return {

            current,

            averageMemoryMB:

                Number(

                    averageMemory.toFixed(2),

                ),

            averageCPU:

                Number(

                    averageCPU.toFixed(2),

                ),

            samples:

                this.history.length,

        };

    }





    /*
    ======================================================
    History
    ======================================================
    */

    public historyData():

        PerformanceSnapshot[] {

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

}





/*
==========================================================
Singleton
==========================================================
*/

export const performanceMonitor =

    new PerformanceMonitor();

