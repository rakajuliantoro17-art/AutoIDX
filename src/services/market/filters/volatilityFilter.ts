/**
==========================================================
AURA Trade OS
Volatility Filter
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    Candle,

} from "@/services/exchange";

export interface VolatilityFilterOptions {

    /**
     * Minimum volatility (%)
     */
    minimumVolatility?: number;

    /**
     * Maximum volatility (%)
     */
    maximumVolatility?: number;

}

export interface VolatilityFilterResult {

    passed: boolean;

    volatility: number;

    highestHigh: number;

    lowestLow: number;

    reason?: string;

}

export class VolatilityFilter {

    /**
     * Evaluate market volatility.
     */
    static evaluate(

        candles: readonly Candle[],

        options: VolatilityFilterOptions = {}

    ): VolatilityFilterResult {

        if (candles.length === 0) {

            return {

                passed: false,

                volatility: 0,

                highestHigh: 0,

                lowestLow: 0,

                reason: "No candle data.",

            };

        }

        let highestHigh = candles[0].high;

        let lowestLow = candles[0].low;

        for (const candle of candles) {

            if (candle.high > highestHigh) {

                highestHigh = candle.high;

            }

            if (candle.low < lowestLow) {

                lowestLow = candle.low;

            }

        }

        const referencePrice =

            candles[candles.length - 1].close;

        const volatility =

            referencePrice === 0

                ? 0

                : ((highestHigh - lowestLow) /

                    referencePrice) * 100;

        if (

            options.minimumVolatility !== undefined &&

            volatility <

                options.minimumVolatility

        ) {

            return {

                passed: false,

                volatility,

                highestHigh,

                lowestLow,

                reason:

                    "Volatility below minimum threshold.",

            };

        }

        if (

            options.maximumVolatility !== undefined &&

            volatility >

                options.maximumVolatility

        ) {

            return {

                passed: false,

                volatility,

                highestHigh,

                lowestLow,

                reason:

                    "Volatility above maximum threshold.",

            };

        }

        return {

            passed: true,

            volatility,

            highestHigh,

            lowestLow,

        };

    }

}
