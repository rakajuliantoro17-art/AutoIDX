/**
==========================================================
AURA Trade OS
Performance Metrics
Version : 0.2.0 Alpha
==========================================================
Performance Runtime Metrics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface PerformanceMetricsSnapshot {

    totalOperations: number;

    successfulOperations: number;

    failedOperations: number;

    averageDurationMS: number;

    lastDurationMS: number;

    operationsPerSecond: number;

    lastOperationAt?: Date;

}





/*
==========================================================
Performance Metrics
==========================================================
*/

export class PerformanceMetrics {

    private totalOperations = 0;

    private successfulOperations = 0;

    private failedOperations = 0;

    private totalDurationMS = 0;

    private lastDurationMS = 0;

    private startedAt = Date.now();

    private lastOperationAt?: Date;





    /*
    ======================================================
    Success
    ======================================================
    */

    public recordSuccess(

        durationMS: number,

    ): void {

        this.totalOperations++;

        this.successfulOperations++;

        this.totalDurationMS +=

            durationMS;

        this.lastDurationMS =

            durationMS;

        this.lastOperationAt =

            new Date();

    }





    /*
    ======================================================
    Failure
    ======================================================
    */

    public recordFailure(

        durationMS: number,

    ): void {

        this.totalOperations++;

        this.failedOperations++;

        this.totalDurationMS +=

            durationMS;

        this.lastDurationMS =

            durationMS;

        this.lastOperationAt =

            new Date();

    }





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        PerformanceMetricsSnapshot {

        const uptimeSeconds =

            Math.max(

                1,

                (

                    Date.now() -

                    this.startedAt

                ) / 1000,

            );



        const snapshot = {

            totalOperations:

                this.totalOperations,

            successfulOperations:

                this.successfulOperations,

            failedOperations:

                this.failedOperations,

            averageDurationMS:

                this.totalOperations === 0

                    ? 0

                    : Number(

                        (

                            this.totalDurationMS /

                            this.totalOperations

                        ).toFixed(2),

                    ),

            lastDurationMS:

                this.lastDurationMS,

            operationsPerSecond:

                Number(

                    (

                        this.totalOperations /

                        uptimeSeconds

                    ).toFixed(2),

                ),

            lastOperationAt:

                this.lastOperationAt,

        };



        logger.debug(

            "Performance metrics collected.",

        );



        return snapshot;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): void {

        this.totalOperations = 0;

        this.successfulOperations = 0;

        this.failedOperations = 0;

        this.totalDurationMS = 0;

        this.lastDurationMS = 0;

        this.startedAt =

            Date.now();

        this.lastOperationAt =

            undefined;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const performanceMetrics =

    new PerformanceMetrics();

