/**
==========================================================
AURA Trade OS
Volume Aggregator
Version : 0.1.1 Alpha
==========================================================
*/

import type { Candle } from "@/services/exchange";

export interface VolumeStatistics {

    totalVolume: number;

    averageVolume: number;

    highestVolume: number;

    lowestVolume: number;

    latestVolume: number;

    volumeChange: number;

    volumeRatio: number;

    candleCount: number;

}

export class VolumeAggregator {

    /**
     * Aggregate volume statistics.
     */
    static aggregate(

        candles: readonly Candle[]

    ): VolumeStatistics {

        if (candles.length === 0) {

            return {

                totalVolume: 0,

                averageVolume: 0,

                highestVolume: 0,

                lowestVolume: 0,

                latestVolume: 0,

                volumeChange: 0,

                volumeRatio: 0,

                candleCount: 0,

            };

        }

        let totalVolume = 0;

        let highestVolume = candles[0].volume;

        let lowestVolume = candles[0].volume;

        for (const candle of candles) {

            totalVolume += candle.volume;

            if (candle.volume > highestVolume) {

                highestVolume = candle.volume;

            }

            if (candle.volume < lowestVolume) {

                lowestVolume = candle.volume;

            }

        }

        const averageVolume =

            totalVolume / candles.length;

        const latestVolume =

            candles[candles.length - 1].volume;

        const volumeChange =

            latestVolume - averageVolume;

        const volumeRatio =

            averageVolume === 0

                ? 0

                : latestVolume / averageVolume;

        return {

            totalVolume,

            averageVolume,

            highestVolume,

            lowestVolume,

            latestVolume,

            volumeChange,

            volumeRatio,

            candleCount: candles.length,

        };

    }

}
