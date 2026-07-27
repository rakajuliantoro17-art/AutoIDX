/**
==========================================================
AURA Trade OS
Spread Filter
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    OrderBook,

} from "@/services/exchange";

export interface SpreadFilterOptions {

    /**
     * Maximum allowed spread (absolute price).
     */
    maximumSpread?: number;

    /**
     * Maximum allowed spread percentage.
     */
    maximumSpreadPercent?: number;

}

export interface SpreadFilterResult {

    passed: boolean;

    bestBid: number;

    bestAsk: number;

    spread: number;

    spreadPercent: number;

    reason?: string;

}

export class SpreadFilter {

    /**
     * Evaluate current market spread.
     */
    static evaluate(

        orderBook: OrderBook,

        options: SpreadFilterOptions = {}

    ): SpreadFilterResult {

        const bestBid =

            orderBook.bids.length > 0

                ? orderBook.bids[0][0]

                : 0;

        const bestAsk =

            orderBook.asks.length > 0

                ? orderBook.asks[0][0]

                : 0;

        if (

            bestBid === 0 ||

            bestAsk === 0

        ) {

            return {

                passed: false,

                bestBid,

                bestAsk,

                spread: 0,

                spreadPercent: 0,

                reason:

                    "Incomplete order book.",

            };

        }

        const spread =

            bestAsk - bestBid;

        const spreadPercent =

            (spread / bestBid) * 100;

        if (

            options.maximumSpread !== undefined &&

            spread >

                options.maximumSpread

        ) {

            return {

                passed: false,

                bestBid,

                bestAsk,

                spread,

                spreadPercent,

                reason:

                    "Spread exceeds maximum threshold.",

            };

        }

        if (

            options.maximumSpreadPercent !== undefined &&

            spreadPercent >

                options.maximumSpreadPercent

        ) {

            return {

                passed: false,

                bestBid,

                bestAsk,

                spread,

                spreadPercent,

                reason:

                    "Spread percentage exceeds maximum threshold.",

            };

        }

        return {

            passed: true,

            bestBid,

            bestAsk,

            spread,

            spreadPercent,

        };

    }

}
