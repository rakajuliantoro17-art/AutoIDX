/**
==========================================================
AURA Trade OS
Risk Analytics
Version : 0.2.0 Alpha
==========================================================
Trading Risk Analytics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Risk Record
==========================================================
*/

export interface RiskRecord {

    exposure: number;

    loss: number;

    timestamp: Date;

}





/*
==========================================================
Risk Report
==========================================================
*/

export interface RiskReport {

    totalRecords: number;

    averageExposure: number;

    maximumExposure: number;

    averageLoss: number;

    maximumLoss: number;

    totalLoss: number;

    riskScore: number;

}





/*
==========================================================
Risk Analytics
==========================================================
*/

export class RiskAnalytics {

    private readonly records:

        RiskRecord[] = [];





    /*
    ======================================================
    Record
    ======================================================
    */

    public record(

        exposure: number,

        loss: number,

    ): void {

        this.records.push({

            exposure,

            loss,

            timestamp:

                new Date(),

        });



        logger.debug(

            `Risk recorded: exposure=${exposure}, loss=${loss}`,

        );

    }





    /*
    ======================================================
    Report
    ======================================================
    */

    public report():

        RiskReport {

        const totalRecords =

            this.records.length;



        if (

            totalRecords === 0

        ) {

            return {

                totalRecords: 0,

                averageExposure: 0,

                maximumExposure: 0,

                averageLoss: 0,

                maximumLoss: 0,

                totalLoss: 0,

                riskScore: 100,

            };

        }



        const exposures =

            this.records.map(

                (record) =>

                    record.exposure,

            );



        const losses =

            this.records.map(

                (record) =>

                    record.loss,

            );



        const totalLoss =

            losses.reduce(

                (

                    total,

                    value,

                ) =>

                    total + value,

                0,

            );



        const averageExposure =

            exposures.reduce(

                (

                    total,

                    value,

                ) =>

                    total + value,

                0,

            ) / totalRecords;



        const averageLoss =

            totalLoss /

            totalRecords;



        return {

            totalRecords,

            averageExposure,

            maximumExposure:

                Math.max(

                    ...exposures,

                ),

            averageLoss,

            maximumLoss:

                Math.max(

                    ...losses,

                ),

            totalLoss,

            riskScore:

                this.calculateRiskScore(

                    averageExposure,

                    averageLoss,

                ),

        };

    }





    /*
    ======================================================
    Risk Score
    ======================================================
    */

    private calculateRiskScore(

        exposure: number,

        loss: number,

    ): number {

        const score =

            100 -

            (exposure * 0.5) -

            (loss * 0.5);



        return Math.max(

            0,

            Math.min(

                100,

                Math.round(

                    score,

                ),

            ),

        );

    }





    /*
    ======================================================
    Count
    ======================================================
    */

    public count(): number {

        return this.records.length;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): void {

        this.records.length = 0;



        logger.info(

            "Risk analytics reset.",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const riskAnalytics =

    new RiskAnalytics();

