/**
==========================================================
AURA Trade OS
Metrics Collector
Version : 0.2.0 Alpha
==========================================================
Aggregate Runtime Metrics
==========================================================
*/

import {

    applicationMetrics,

    type ApplicationMetricsSnapshot,

} from "./applicationMetrics";

import {

    exchangeMetrics,

    type ExchangeMetricsSnapshot,

} from "./exchangeMetrics";





/*
==========================================================
Types
==========================================================
*/

export interface MetricsSnapshot {

    application:

        ApplicationMetricsSnapshot;

    exchange:

        ExchangeMetricsSnapshot;

    collectedAt: Date;

}





/*
==========================================================
Metrics Collector
==========================================================
*/

export class MetricsCollector {

    private lastSnapshot?:

        MetricsSnapshot;





    /*
    ======================================================
    Collect
    ======================================================
    */

    public collect():

        MetricsSnapshot {

        const snapshot = {

            application:

                applicationMetrics.snapshot(),

            exchange:

                exchangeMetrics.snapshot(),

            collectedAt:

                new Date(),

        };



        this.lastSnapshot =

            snapshot;



        return snapshot;

    }





    /*
    ======================================================
    Last Snapshot
    ======================================================
    */

    public getLastSnapshot():

        MetricsSnapshot |

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

        applicationMetrics.reset();

        exchangeMetrics.reset();



        this.lastSnapshot =

            undefined;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const metricsCollector =

    new MetricsCollector();

