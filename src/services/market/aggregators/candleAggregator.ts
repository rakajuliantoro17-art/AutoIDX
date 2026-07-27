/**
==========================================================
AURA Trade OS
Candle Aggregator
Version : 0.1.1 Alpha
==========================================================
*/

import type { Candle } from "@/services/exchange";

export interface CandleStatistics {

    firstOpen: number;

    lastClose: number;

    highestHigh: number;

    lowestLow: number;

    totalVolume: number;

    averageClose: number;

    averageVolume: number;

    candleCount: number;

}

export class CandleAggregator {

    /**
     * Aggregate OHLCV candles into statistics.
     */
    static aggregate(

        candles: readonly Candle[]

    ): CandleStatistics {

        if (candles.length === 0) {

            return {

                firstOpen: 0,

                lastClose: 0,

                highestHigh: 0,

                lowestLow: 0,

                totalVolume: 0,

                averageClose: 0,

                averageVolume: 0,

                candleCount: 0,

            };

        }

        let highestHigh = candles[0].high;

        let lowestLow = candles[0].low;

        let totalVolume = 0;

        let totalClose = 0;

        for (const candle of candles) {

            if (candle.high > highestHigh) {

                highestHigh = candle.high;

            }

            if (candle.low < lowestLow) {

                lowestLow = candle.low;

            }

            totalVolume += candle.volume;

            totalClose += candle.close;

        }

        return {

            firstOpen: candles[0].open,

            lastClose: candles[candles.length - 1].close,

            highestHigh,

            lowestLow,

            totalVolume,

            averageClose:

                totalClose / candles.length,

            averageVolume:

                totalVolume / candles.length,

            candleCount: candles.length,

        };

    }

}
