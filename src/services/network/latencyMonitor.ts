/**
==========================================================
AURA Trade OS
Latency Monitor
Version : 0.3.0 Alpha
==========================================================
Application Latency Monitor
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface LatencySnapshot {

    target: string;

    latency: number;

    timestamp: Date;

}





/*
==========================================================
Latency Monitor
==========================================================
*/

export class LatencyMonitor {

    /*
    ======================================================
    Measure
    ======================================================
    */

    public async measure<T>(

        target: string,

        operation: () => Promise<T>,

    ): Promise<{

        result: T;

        snapshot: LatencySnapshot;

    }> {

        const start =

            performance.now();



        const result =

            await operation();



        const latency =

            performance.now() -

            start;



        const snapshot: LatencySnapshot = {

            target,

            latency,

            timestamp:

                new Date(),

        };



        logger.debug(

            `Latency ${target}: ${latency.toFixed(2)} ms`,

        );



        return {

            result,

            snapshot,

        };

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const latencyMonitor =

    new LatencyMonitor();
```

