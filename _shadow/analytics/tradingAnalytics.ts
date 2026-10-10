/**
==========================================================
AURA Trade OS
Trading Analytics
Version : 0.2.0 Alpha
==========================================================
Trading Analytics
==========================================================
*/

import logger from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface TradingRecord {

    symbol: string;

    side: "BUY" | "SELL";

    quantity: number;

    price: number;

    fee: number;

    profit: number;

    timestamp: Date;

}





export interface TradingSummary {

    totalTrades: number;

    totalVolume: number;

    totalFees: number;

    totalProfit: number;

    averageProfit: number;

    winningTrades: number;

    losingTrades: number;

    winRate: number;

}





/*
==========================================================
Trading Analytics
==========================================================
*/

export class TradingAnalytics {

    private readonly trades:

        TradingRecord[] = [];





    /*
    ======================================================
    Record
    ======================================================
    */

    public record(

        trade: TradingRecord,

    ): void {

        this.trades.push(trade);



        logger.debug(

            `Trade recorded: ${trade.symbol}`,

        );

    }





    /*
    ======================================================
    Summary
    ======================================================
    */

    public summary():

        TradingSummary {

        const totalTrades =

            this.trades.length;



        if (

            totalTrades === 0

        ) {

            return {

                totalTrades: 0,

                totalVolume: 0,

                totalFees: 0,

                totalProfit: 0,

                averageProfit: 0,

                winningTrades: 0,

                losingTrades: 0,

                winRate: 0,

            };

        }



        const totalVolume =

            this.trades.reduce(

                (

                    total,

                    trade,

                ) =>

                    total +

                    trade.quantity *

                    trade.price,

                0,

            );



        const totalFees =

            this.trades.reduce(

                (

                    total,

                    trade,

                ) =>

                    total +

                    trade.fee,

                0,

            );



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



        return {

            totalTrades,

            totalVolume,

            totalFees,

            totalProfit,

            averageProfit:

                totalProfit /

                totalTrades,

            winningTrades,

            losingTrades,

            winRate:

                (

                    winningTrades /

                    totalTrades

                ) * 100,

        };

    }





    /*
    ======================================================
    Recent Trades
    ======================================================
    */

    public recent(

        limit = 10,

    ): TradingRecord[] {

        return this.trades

            .slice(-limit)

            .reverse();

    }





    /*
    ======================================================
    Count
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

            "Trading analytics reset.",

        );

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const tradingAnalytics =

    new TradingAnalytics();

