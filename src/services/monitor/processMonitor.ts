/**
==========================================================
AURA Trade OS
Process Monitor
Version : 0.1.0 Alpha
==========================================================
Node.js Process Monitoring Service
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface ProcessSnapshot {

    pid: number;

    platform: string;

    architecture: string;

    nodeVersion: string;

    environment: string;

    uptimeSeconds: number;

    rssMB: number;

    heapUsedMB: number;

    heapTotalMB: number;

    activeHandles: number;

    activeRequests: number;

    timestamp: number;

}





/*
==========================================================
Process Monitor
==========================================================
*/

export class ProcessMonitor {

    private readonly history:

        ProcessSnapshot[] = [];



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

        ProcessSnapshot {

        const memory =

            process.memoryUsage();

        const handles =

            (process as NodeJS.Process & {

                _getActiveHandles?: () => unknown[];

            })._getActiveHandles?.() ?? [];

        const requests =

            (process as NodeJS.Process & {

                _getActiveRequests?: () => unknown[];

            })._getActiveRequests?.() ?? [];

        const snapshot: ProcessSnapshot = {

            pid:

                process.pid,

            platform:

                process.platform,

            architecture:

                process.arch,

            nodeVersion:

                process.version,

            environment:

                process.env.NODE_ENV ??

                "development",

            uptimeSeconds:

                Number(

                    process.uptime()

                        .toFixed(2),

                ),

            rssMB:

                this.toMB(

                    memory.rss,

                ),

            heapUsedMB:

                this.toMB(

                    memory.heapUsed,

                ),

            heapTotalMB:

                this.toMB(

                    memory.heapTotal,

                ),

            activeHandles:

                handles.length,

            activeRequests:

                requests.length,

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

            "Process snapshot recorded.",

            {

                pid: snapshot.pid,

                uptime: snapshot.uptimeSeconds,

            },

        );

        return snapshot;

    }





    /*
    ======================================================
    Latest
    ======================================================
    */

    public latest():

        ProcessSnapshot {

        return this.snapshot();

    }





    /*
    ======================================================
    History
    ======================================================
    */

    public getHistory():

        ProcessSnapshot[] {

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
    Is Healthy
    ======================================================
    */

    public isHealthy(): boolean {

        const snapshot =

            this.snapshot();

        return (

            snapshot.heapUsedMB < 1024 &&

            snapshot.activeHandles < 1000

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const processMonitor =

    new ProcessMonitor();

