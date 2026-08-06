/**
==========================================================
AURA Trade OS
Portfolio Analytics
Version : 0.2.0 Alpha
==========================================================
Portfolio Performance Analytics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Trade Record
==========================================================
*/

export interface TradeRecord {

    profit: number;

    timestamp: Date;

}





/*
==========================================================
Portfolio Report
==========================================================
*/

export interface PortfolioReport {

    totalTrades: number;

    winningTrades: number;

    losingTrades: number;

    winRate: number;

    totalProfit: number;

    averageProfit: number;

    bestTrade: number;

    worstTrade: number;

    maxDrawdown: number;

}





/*
==========================================================
Portfolio Analytics
==========================================================
*/

export class PortfolioAnalytics {

    private readonly trades:

        TradeRecord[] = [];





    /*
    ======================================================
    Record Trade
    ======================================================
    */

    public recordTrade(

        profit: number,

    ): void {

        this.trades.push({

            profit,

            timestamp:

                new Date(),

        });



        logger.debug(

            `Trade recorded: ${profit}`,

        );

    }





    /*
    ======================================================
    Generate Report
    ======================================================
    */

    public report():

        PortfolioReport {

        const totalTrades =

            this.trades.length;



        const winningTrades =

            this.trades.filter(

                (trade) =>

                    trade.profit > 0,

            ).length;



        const losingTrades =

            this.trades.filter(

                (trade) =>

                    trade.profit < 0,

            ).length;



        const totalProfit =

            this.trades.reduce(

                (

                    total,

                    trade,

                ) =>

                    total +

                    trade.profit,

                0,

            );



        const averageProfit =

            totalTrades > 0

                ? totalProfit /

                  totalTrades

                : 0;



        const profits =

            this.trades.map(

                (trade) =>

                    trade.profit,

            );



        return {

            totalTrades,

            winningTrades,

            losingTrades,

            winRate:

                totalTrades > 0

                    ? (

                        winningTrades /

                        totalTrades

                    ) * 100

                    : 0,

            totalProfit,

            averageProfit,

            bestTrade:

                profits.length

                    ? Math.max(

                        ...profits,

                    )

                    : 0,

            worstTrade:

                profits.length

                    ? Math.min(

                        ...profits,

                    )

                    : 0,

            maxDrawdown:

                this.calculateDrawdown(),

        };

    }





    /*
    ======================================================
    Drawdown
    ======================================================
    */

    private calculateDrawdown():

        number {

        let peak = 0;

        let equity = 0;

        let drawdown = 0;



        for (

            const trade

            of this.trades

        ) {

            equity +=

                trade.profit;



            peak = Math.max(

                peak,

                equity,

            );



            drawdown = Math.max(

                drawdown,

                peak - equity,

            );

        }



        return drawdown;

    }





    /*
    ======================================================
    Total Trades
    ======================================================
    */

    public count(): number {

        return this.trades.length;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): void {

        this.trades.length = 0;



        logger.info(

            "Portfolio analytics reset.",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const portfolioAnalytics =

    new PortfolioAnalytics();

