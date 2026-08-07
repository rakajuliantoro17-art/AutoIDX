/**
==========================================================
AURA Trade OS
Analytics Engine
Version : 0.2.0 Alpha
==========================================================
Central Analytics Engine
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface AnalyticsMetric {

    name: string;

    value: number;

    timestamp: Date;

}





/*
==========================================================
Analytics Summary
==========================================================
*/

export interface AnalyticsSummary {

    count: number;

    minimum: number;

    maximum: number;

    average: number;

}





/*
==========================================================
Analytics Engine
==========================================================
*/

export class AnalyticsEngine {

    private readonly metrics =

        new Map<

            string,

            AnalyticsMetric[]

        >();





    /*
    ======================================================
    Record
    ======================================================
    */

    public record(

        name: string,

        value: number,

    ): void {

        if (

            !this.metrics.has(name)

        ) {

            this.metrics.set(

                name,

                [],

            );

        }



        this.metrics

            .get(name)!

            .push({

                name,

                value,

                timestamp:

                    new Date(),

            });



        logger.debug(

            `Analytics recorded: ${name}=${value}`,

        );

    }





    /*
    ======================================================
    Get Metrics
    ======================================================
    */

    public getMetrics(

        name: string,

    ): AnalyticsMetric[] {

        return [

            ...(this.metrics.get(

                name,

            ) ?? []),

        ];

    }





    /*
    ======================================================
    Summary
    ======================================================
    */

    public getSummary(

        name: string,

    ): AnalyticsSummary | null {

        const metrics =

            this.metrics.get(name);



        if (

            !metrics ||

            metrics.length === 0

        ) {

            return null;

        }



        const values =

            metrics.map(

                (metric) =>

                    metric.value,

            );



        const total =

            values.reduce(

                (

                    sum,

                    value,

                ) =>

                    sum + value,

                0,

            );



        return {

            count:

                values.length,

            minimum:

                Math.min(

                    ...values,

                ),

            maximum:

                Math.max(

                    ...values,

                ),

            average:

                total /

                values.length,

        };

    }





    /*
    ======================================================
    Remove Metric
    ======================================================
    */

    public remove(

        name: string,

    ): void {

        this.metrics.delete(

            name,

        );

    }





    /*
    ======================================================
    Clear
    ======================================================
    */

    public clear(): void {

        this.metrics.clear();

    }





    /*
    ======================================================
    Metric Count
    ======================================================
    */

    public metricCount(): number {

        return this.metrics.size;

    }





    /*
    ======================================================
    Metric Names
    ======================================================
    */

    public names(): string[] {

        return [

            ...this.metrics.keys(),

        ].sort();

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const analyticsEngine =

    new AnalyticsEngine();

