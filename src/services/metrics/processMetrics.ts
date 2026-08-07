/**
==========================================================
AURA Trade OS
Process Metrics
Version : 0.2.0 Alpha
==========================================================
Node.js Process Metrics
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface ProcessMetricsSnapshot {

    pid: number;

    platform: NodeJS.Platform;

    nodeVersion: string;

    uptime: number;

    workingDirectory: string;

    title: string;

    argvCount: number;

    activeHandles: number;

    activeRequests: number;

    timestamp: Date;

}





/*
==========================================================
Process Metrics
==========================================================
*/

export class ProcessMetrics {

    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        ProcessMetricsSnapshot {

        const processAny =

            process as NodeJS.Process & {

                _getActiveHandles?: () => unknown[];

                _getActiveRequests?: () => unknown[];

            };



        const snapshot = {

            pid:

                process.pid,

            platform:

                process.platform,

            nodeVersion:

                process.version,

            uptime:

                process.uptime(),

            workingDirectory:

                process.cwd(),

            title:

                process.title,

            argvCount:

                process.argv.length,

            activeHandles:

                processAny

                    ._getActiveHandles?.()

                    .length ?? 0,

            activeRequests:

                processAny

                    ._getActiveRequests?.()

                    .length ?? 0,

            timestamp:

                new Date(),

        };



        logger.debug(

            "Process metrics collected.",

        );



        return snapshot;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const processMetrics =

    new ProcessMetrics();

