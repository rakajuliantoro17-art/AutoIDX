/**
==========================================================
AURA Trade OS
Latency Monitor
Version : 0.1.0 Alpha
==========================================================
Latency Monitoring Service
==========================================================
*/

import { logger } from "@/services/logger";



/*
==========================================================
Types
==========================================================
*/

export interface LatencyResult {

    target: string;

    latency: number;

    success: boolean;

    timestamp: number;

}



export interface LatencyStatistics {

    count: number;

    minimum: number;

    maximum: number;

    average: number;

}





/*
==========================================================
Latency Monitor
==========================================================
*/

export class LatencyMonitor {

    private readonly history =

        new Map<string, number[]>();





    /*
    ======================================================
    Measure
    ======================================================
    */

    public async measure(

        target: string,

        task: () => Promise<unknown>,

    ): Promise<LatencyResult> {

        const started = performance.now();

        try {

            await task();

            const latency =

                performance.now() - started;

            this.store(

                target,

                latency,

            );

            logger.info(

                "Latency measured.",

                {

                    target,

                    latency,

                },

            );

            return {

                target,

                latency,

                success: true,

                timestamp: Date.now(),

            };

        }

        catch (error) {

            const latency =

                performance.now() - started;

            logger.error(

                "Latency measurement failed.",

                error,

                {

                    target,

                    latency,

                },

            );

            return {

                target,

                latency,

                success: false,

                timestamp: Date.now(),

            };

        }

    }





    /*
    ======================================================
    Store
    ======================================================
    */

    private store(

        target: string,

        latency: number,

    ): void {

        const values =

            this.history.get(target) ??

            [];

        values.push(latency);

        if (

            values.length > 100

        ) {

            values.shift();

        }

        this.history.set(

            target,

            values,

        );

    }





    /*
    ======================================================
    Statistics
    ======================================================
    */

    public statistics(

        target: string,

    ): LatencyStatistics | null {

        const values =

            this.history.get(target);

        if (

            !values ||

            values.length === 0

        ) {

            return null;

        }

        const total =

            values.reduce(

                (sum, value) =>

                    sum + value,

                0,

            );

        return {

            count:

                values.length,

            minimum:

                Math.min(...values),

            maximum:

                Math.max(...values),

            average:

                Number(

                    (

                        total /

                        values.length

                    ).toFixed(2),

                ),

        };

    }





    /*
    ======================================================
    History
    ======================================================
    */

    public getHistory(

        target: string,

    ): number[] {

        return [

            ...(this.history.get(target) ??

            []),

        ];

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(

        target?: string,

    ): void {

        if (target) {

            this.history.delete(target);

            return;

        }

        this.history.clear();

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

