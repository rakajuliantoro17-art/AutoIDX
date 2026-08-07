/**
==========================================================
AURA Trade OS
Application Metrics
Version : 0.2.0 Alpha
==========================================================
Application Runtime Metrics
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface ApplicationMetricsSnapshot {

    uptime: number;

    memory: NodeJS.MemoryUsage;

    cpuUsage: NodeJS.CpuUsage;

    timestamp: Date;

}





/*
==========================================================
Application Metrics
==========================================================
*/

export class ApplicationMetrics {

    private lastSnapshot?:

        ApplicationMetricsSnapshot;





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        ApplicationMetricsSnapshot {

        const snapshot = {

            uptime:

                process.uptime(),

            memory:

                process.memoryUsage(),

            cpuUsage:

                process.cpuUsage(),

            timestamp:

                new Date(),

        };



        this.lastSnapshot =

            snapshot;



        logger.debug(

            "Application metrics collected.",

        );



        return snapshot;

    }





    /*
    ======================================================
    Last Snapshot
    ======================================================
    */

    public getLastSnapshot():

        ApplicationMetricsSnapshot |

        undefined {

        return this.lastSnapshot;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset():

        void {

        this.lastSnapshot =

            undefined;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const applicationMetrics =

    new ApplicationMetrics();

