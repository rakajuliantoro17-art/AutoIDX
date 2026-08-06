/**
==========================================================
AURA Trade OS
Diagnostics Collector
Version : 0.3.0 Alpha
==========================================================
Diagnostics Collector
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface DiagnosticsSnapshot {

    cpuUsage: number;

    memoryUsage: number;

    uptimeSeconds: number;

    activeJobs: number;

    errorCount: number;

    warningCount: number;

    timestamp: Date;

}





/*
==========================================================
Diagnostics Collector
==========================================================
*/

export class DiagnosticsCollector {

    /*
    ======================================================
    Collect
    ======================================================
    */

    public async collect():

        Promise<DiagnosticsSnapshot> {

        /*
        ==============================================
        Future integrations

        runtimeMetrics
        processMetrics
        schedulerMetrics
        cacheMetrics
        exchangeMetrics
        networkMetrics
        ==============================================
        */

        const snapshot: DiagnosticsSnapshot = {

            cpuUsage: 0,

            memoryUsage: 0,

            uptimeSeconds:

                process.uptime(),

            activeJobs: 0,

            errorCount: 0,

            warningCount: 0,

            timestamp:

                new Date(),

        };



        logger.debug(

            "Diagnostics snapshot collected.",

        );



        return snapshot;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const diagnosticsCollector =

    new DiagnosticsCollector();
```

