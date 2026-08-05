/**
==========================================================
AURA Trade OS
Trading Metrics
Version : 0.2.0 Alpha
==========================================================
Trading Runtime Metrics
==========================================================
*/

import { logger } from "@/services/logger";





/*
==========================================================
Types
==========================================================
*/

export interface TradingMetricsSnapshot {

    totalTrades: number;

    buyOrders: number;

    sellOrders: number;

    successfulTrades: number;

    failedTrades: number;

    totalVolume: number;

    lastPair?: string;

    lastTradeAt?: Date;

}





/*
==========================================================
Trading Metrics
==========================================================
*/

export class TradingMetrics {

    private totalTrades = 0;

    private buyOrders = 0;

    private sellOrders = 0;

    private successfulTrades = 0;

    private failedTrades = 0;

    private totalVolume = 0;

    private lastPair?: string;

    private lastTradeAt?: Date;





    /*
    ======================================================
    Buy
    ======================================================
    */

    public recordBuy(

        pair: string,

        volume: number,

        success = true,

    ): void {

        this.totalTrades++;

        this.buyOrders++;

        this.totalVolume +=

            volume;

        this.lastPair =

            pair;

        this.lastTradeAt =

            new Date();



        if (success) {

            this.successfulTrades++;

        }

        else {

            this.failedTrades++;

        }

    }





    /*
    ======================================================
    Sell
    ======================================================
    */

    public recordSell(

        pair: string,

        volume: number,

        success = true,

    ): void {

        this.totalTrades++;

        this.sellOrders++;

        this.totalVolume +=

            volume;

        this.lastPair =

            pair;

        this.lastTradeAt =

            new Date();



        if (success) {

            this.successfulTrades++;

        }

        else {

            this.failedTrades++;

        }

    }





    /*
    ======================================================
    Snapshot
    ======================================================
    */

    public snapshot():

        TradingMetricsSnapshot {

        const snapshot = {

            totalTrades:

                this.totalTrades,

            buyOrders:

                this.buyOrders,

            sellOrders:

                this.sellOrders,

            successfulTrades:

                this.successfulTrades,

            failedTrades:

                this.failedTrades,

            totalVolume:

                Number(

                    this.totalVolume.toFixed(8),

                ),

            lastPair:

                this.lastPair,

            lastTradeAt:

                this.lastTradeAt,

        };



        logger.debug(

            "Trading metrics collected.",

        );



        return snapshot;

    }





    /*
    ======================================================
    Reset
    ======================================================
    */

    public reset(): void {

        this.totalTrades = 0;

        this.buyOrders = 0;

        this.sellOrders = 0;

        this.successfulTrades = 0;

        this.failedTrades = 0;

        this.totalVolume = 0;

        this.lastPair =

            undefined;

        this.lastTradeAt =

            undefined;

    }

}





/*
==========================================================
Singleton
==========================================================
*/

export const tradingMetrics =

    new TradingMetrics();
```

