/**
==========================================================
AURA Trade OS
Trade Aggregator
Version : 0.1.1 Alpha
==========================================================
*/

import type { Trade } from "@/services/exchange";

export interface TradeStatistics {

    tradeCount: number;

    totalVolume: number;

    averagePrice: number;

    averageSize: number;

    highestPrice: number;

    lowestPrice: number;

    latestPrice: number;

    buyVolume: number;

    sellVolume: number;

    buyRatio: number;

    sellRatio: number;

}

export class TradeAggregator {

    /**
     * Aggregate trade statistics.
     */
    static aggregate(

        trades: readonly Trade[]

    ): TradeStatistics {

        if (trades.length === 0) {

            return {

                tradeCount: 0,

                totalVolume: 0,

                averagePrice: 0,

                averageSize: 0,

                highestPrice: 0,

                lowestPrice: 0,

                latestPrice: 0,

                buyVolume: 0,

                sellVolume: 0,

                buyRatio: 0,

                sellRatio: 0,

            };

        }

        let totalVolume = 0;

        let weightedPrice = 0;

        let highestPrice = trades[0].price;

        let lowestPrice = trades[0].price;

        let buyVolume = 0;

        let sellVolume = 0;

        for (const trade of trades) {

            totalVolume += trade.amount;

            weightedPrice +=

                trade.price * trade.amount;

            if (trade.price > highestPrice) {

                highestPrice = trade.price;

            }

            if (trade.price < lowestPrice) {

                lowestPrice = trade.price;

            }

            if (

                trade.side === "BUY"

            ) {

                buyVolume += trade.amount;

            } else {

                sellVolume += trade.amount;

            }

        }

        const averagePrice =

            totalVolume === 0

                ? 0

                : weightedPrice / totalVolume;

        const averageSize =

            totalVolume / trades.length;

        const buyRatio =

            totalVolume === 0

                ? 0

                : buyVolume / totalVolume;

        const sellRatio =

            totalVolume === 0

                ? 0

                : sellVolume / totalVolume;

        return {

            tradeCount: trades.length,

            totalVolume,

            averagePrice,

            averageSize,

            highestPrice,

            lowestPrice,

            latestPrice:

                trades[trades.length - 1].price,

            buyVolume,

            sellVolume,

            buyRatio,

            sellRatio,

        };

    }

}
