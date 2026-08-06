/**
==========================================================
AURA Trade OS
Strategy Analytics
Version : 0.2.0 Alpha
==========================================================
Trading Strategy Analytics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface StrategyRecord {

    strategy: string;

    success: boolean;

    profit: number;

    executionTime: number;

    timestamp: Date;

}





export interface StrategyReport {

    strategy: string;

    executions: number;

    successfulExecutions: number;

    failedExecutions: number;

    successRate: number;

    totalProfit: number;

    averageProfit: number;

    averageExecutionTime: number;

}





/*
==========================================================
Strategy Analytics
==========================================================
*/

export class StrategyAnalytics {

    private readonly records:

        StrategyRecord[] = [];





    /*
    ======================================================
    Record
    ======================================================
    */

    public record(

        strategy: string,

        success: boolean,

        profit: number,

        executionTime: number,

    ): void {

        this.records.push({

            strategy,

            success,

            profit,

            executionTime,

            timestamp:

                new Date(),

        });



        logger.debug(

            `Strategy recorded: ${strategy}`,

        );

    }





    /*
    ======================================================
    Report
    ======================================================
    */

    public report(

        strategy: string,

    ): StrategyReport | null {

        const records =

            this.records.filter(

                (record) =>

                    record.strategy ===

                    strategy,

            );



        if (

            records.length === 0

        ) {

            return null;

        }



        const executions =

            records.length;



        const successfulExecutions =

            records.filter(

                (record) =>

                    record.success,

            ).length;



        const failedExecutions =

            executions -

            successfulExecutions;



        const totalProfit =

            records.reduce(

                (

                    total,

                    record,

                ) =>

                    total +

                    record.profit,

                0,

            );



        const averageExecutionTime =

            records.reduce(

                (

                    total,

                    record,

                ) =>

                    total +

                    record.executionTime,

                0,

            ) /

            executions;



        return {

            strategy,

            executions,

            successfulExecutions,

            failedExecutions,

            successRate:

                (successfulExecutions /

                    executions) *

                100,

            totalProfit,

            averageProfit:

                totalProfit /

                executions,

            averageExecutionTime,

        };

    }





    /*
    ======================================================
    Strategies
    ======================================================
    */

    public strategies(): string[] {

        return [

            ...new Set(

                this.records.map(

                    (record) =>

                        record.strategy,

                ),

            ),

        ].sort();

    }





    /*
    ======================================================
    Total Records
    ======================================================
    */

    public count(): number {

        return this.records.length;

    }





    /*
    ======================================================
    Reset Strategy
    ======================================================
    */

    public reset(

        strategy: string,

    ): void {

        const remaining =

            this.records.filter(

                (record) =>

                    record.strategy !==

                    strategy,

            );



        this.records.length = 0;

        this.records.push(

            ...remaining,

        );



        logger.info(

            `Strategy analytics reset: ${strategy}`,

        );

    }





    /*
    ======================================================
    Reset All
    ======================================================
    */

    public resetAll(): void {

        this.records.length = 0;



        logger.info(

            "Strategy analytics reset.",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const strategyAnalytics =

    new StrategyAnalytics();

