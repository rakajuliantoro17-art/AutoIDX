/**
==========================================================
AURA Trade OS
Order Book Aggregator
Version : 0.1.1 Alpha
==========================================================
*/

import type { OrderBook } from "@/services/exchange";

export interface OrderBookStatistics {

    bidLevels: number;

    askLevels: number;

    totalBidVolume: number;

    totalAskVolume: number;

    bestBid: number;

    bestAsk: number;

    spread: number;

    spreadPercent: number;

    imbalance: number;

}

export class OrderBookAggregator {

    /**
     * Aggregate order book statistics.
     */
    static aggregate(

        orderBook: OrderBook

    ): OrderBookStatistics {

        const bids = orderBook.bids;

        const asks = orderBook.asks;

        const totalBidVolume = bids.reduce(

            (sum, level) => sum + level.quantity,

            0

        );

        const totalAskVolume = asks.reduce(

            (sum, level) => sum + level.quantity,

            0

        );

        const bestBid =

            bids.length > 0

                ? bids[0].price

                : 0;

        const bestAsk =

            asks.length > 0

                ? asks[0].price

                : 0;

        const spread =

            bestAsk - bestBid;

        const spreadPercent =

            bestBid === 0

                ? 0

                : (spread / bestBid) * 100;

        const totalVolume =

            totalBidVolume +

            totalAskVolume;

        const imbalance =

            totalVolume === 0

                ? 0

                : (totalBidVolume -

                    totalAskVolume) /

                  totalVolume;

        return {

            bidLevels:

                bids.length,

            askLevels:

                asks.length,

            totalBidVolume,

            totalAskVolume,

            bestBid,

            bestAsk,

            spread,

            spreadPercent,

            imbalance,

        };

    }

}
