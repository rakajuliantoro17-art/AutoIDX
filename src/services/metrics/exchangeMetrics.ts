/**
==========================================================
AURA Trade OS
Exchange Metrics
Version : 0.2.0 Alpha
==========================================================
Exchange Runtime Metrics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface ExchangeMetricsSnapshot {

    exchange: string;

    requestCount: number;

    successCount: number;

    failedCount: number;

    averageLatency: number;

    lastLatency: number;

    lastRequest?: Date;

}





/*
==========================================================
Exchange Metrics
==========================================================
*/

export class ExchangeMetrics {

    private readonly exchange =

        "Indodax";



    private requestCount = 0;

    private successCount = 0;

    private failedCount = 0;

    private latencyTotal = 0;

    private lastLatency = 0;

    private lastRequest?:

        Date;





    /*
    ======================================================
    Record Success
    ======================================================
    */

    public recordSuccess(

        latency: number,

    ): void {

        this.requestCount++;

        this.successCount++;

        this.latencyTotal +=

            latency;

        this.lastLatency =

            latency;

        this.lastRequest =

            new Date();

    }





    /*
    ======================================================
    Record Failure
    ======================================================
    */

    public recordFailure(

        latency = 0,

    ): void {

        this.requestCount++;

        this.failedCount++;

        this.latencyTotal +=

            latency;

        this.lastLatency =

            latency;

        this.lastRequest =

            new Date();

    }





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        ExchangeMetricsSnapshot {

        const snapshot = {

            exchange:

                this.exchange,

            requestCount:

                this.requestCount,

            successCount:

                this.successCount,

            failedCount:

                this.failedCount,

            averageLatency:

                this.requestCount === 0

                    ? 0

                    : Number(

                        (

                            this.latencyTotal /

                            this.requestCount

                        ).toFixed(2),

                    ),

            lastLatency:

                this.lastLatency,

            lastRequest:

                this.lastRequest,

        };



        logger.debug(

            "Exchange metrics collected.",

        );



        return snapshot;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset():

        void {

        this.requestCount = 0;

        this.successCount = 0;

        this.failedCount = 0;

        this.latencyTotal = 0;

        this.lastLatency = 0;

        this.lastRequest =

            undefined;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const exchangeMetrics =

    new ExchangeMetrics();
```

