/**
==========================================================
AURA Trade OS
Performance Analytics
Version : 0.2.0 Alpha
==========================================================
Performance Analytics Service
==========================================================
*/

import { logger } from "@/services/logger";

import {

    analyticsEngine,

} from "./analyticsEngine";





/*
==========================================================
Performance Report
==========================================================
*/

export interface PerformanceReport {

    metric: string;

    count: number;

    average: number;

    minimum: number;

    maximum: number;

    healthScore: number;

}





/*
==========================================================
Performance Analytics
==========================================================
*/

export class PerformanceAnalytics {

    /*
    ======================================================
    Record
    ======================================================
    */

    public record(

        metric: string,

        value: number,

    ): void {

        analyticsEngine.record(

            metric,

            value,

        );

    }





    /*
    ======================================================
    Report
    ======================================================
    */

    public report(

        metric: string,

    ): PerformanceReport | null {

        const summary =

            analyticsEngine.getSummary(

                metric,

            );



        if (!summary) {

            return null;

        }



        return {

            metric,

            count:

                summary.count,

            average:

                summary.average,

            minimum:

                summary.minimum,

            maximum:

                summary.maximum,

            healthScore:

                this.calculateHealth(

                    summary.average,

                ),

        };

    }





    /*
    ======================================================
    Health Score
    ======================================================
    */

    private calculateHealth(

        average: number,

    ): number {

        if (average <= 100) {

            return 100;

        }



        if (average >= 1000) {

            return 0;

        }



        return Math.round(

            100 -

            (

                (average - 100) /

                900

            ) *

            100,

        );

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(

        metric: string,

    ): void {

        analyticsEngine.remove(

            metric,

        );



        logger.info(

            `Performance metric "${metric}" reset.`,

        );

    }





    /*
    ======================================================
    Reset All
    ======================================================
    */

    public resetAll(): void {

        analyticsEngine.clear();



        logger.info(

            "Performance analytics reset.",

        );

    }





    /*
    ======================================================
    Metrics
    ======================================================
    */

    public metrics(): string[] {

        return analyticsEngine.names();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const performanceAnalytics =

    new PerformanceAnalytics();
```

