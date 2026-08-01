/**
==========================================================
AURA Trade OS
Liquidity Filter
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    OrderBook,

} from "@/services/exchange";

export interface LiquidityFilterOptions {

    /**
     * Minimum total bid volume.
     */
    minimumBidVolume?: number;

    /**
     * Minimum total ask volume.
     */
    minimumAskVolume?: number;

    /**
     * Minimum combined liquidity.
     */
    minimumTotalLiquidity?: number;

}

export interface LiquidityFilterResult {

    passed: boolean;

    bidLiquidity: number;

    askLiquidity: number;

    totalLiquidity: number;

    imbalance: number;

    reason?: string;

}

export class LiquidityFilter {

    /**
     * Evaluate market liquidity.
     */
    static evaluate(

        orderBook: OrderBook,

        options: LiquidityFilterOptions = {}

    ): LiquidityFilterResult {

        const bidLiquidity =

            orderBook.bids.reduce(

                (sum, level) =>

                    sum + level.quantity,

                0

            );

        const askLiquidity =

            orderBook.asks.reduce(

                (sum, level) =>

                    sum + level.quantity,

                0

            );

        const totalLiquidity =

            bidLiquidity +

            askLiquidity;

        const imbalance =

            totalLiquidity === 0

                ? 0

                : (

                    bidLiquidity -

                    askLiquidity

                ) / totalLiquidity;

        if (

            options.minimumBidVolume !== undefined &&

            bidLiquidity 

            options.minimumBidVolume

        ) {

            return {

                passed: false,

                bidLiquidity,

                askLiquidity,

                totalLiquidity,

                imbalance,

                reason:

                    "Bid liquidity below threshold.",

            };

        }

        if (

            options.minimumAskVolume !== undefined &&

            askLiquidity 

            options.minimumAskVolume

        ) {

            return {

                passed: false,

                bidLiquidity,

                askLiquidity,

                totalLiquidity,

                imbalance,

                reason:

                    "Ask liquidity below threshold.",

            };

        }

        if (

            options.minimumTotalLiquidity !== undefined &&

            totalLiquidity 

            options.minimumTotalLiquidity

        ) {

            return {

                passed: false,

                bidLiquidity,

                askLiquidity,

                totalLiquidity,

                imbalance,

                reason:

                    "Total liquidity below threshold.",

            };

        }

        return {

            passed: true,

            bidLiquidity,

            askLiquidity,

            totalLiquidity,

            imbalance,

        };

    }

}
