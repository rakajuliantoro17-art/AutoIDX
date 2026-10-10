/**
==========================================================
AURA Trade OS
Volume Filter
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    Candle,

} from "@/services/exchange";

export interface VolumeFilterOptions {

    /**
     * Minimum average volume.
     */
    minimumAverageVolume?: number;

    /**
     * Minimum latest volume.
     */
    minimumLatestVolume?: number;

    /**
     * Minimum relative volume.
     */
    minimumRelativeVolume?: number;

}

export interface VolumeFilterResult {

    passed: boolean;

    averageVolume: number;

    latestVolume: number;

    relativeVolume: number;

    reason?: string;

}

export class VolumeFilter {

    static evaluate(

        candles: readonly Candle[],

        options: VolumeFilterOptions = {}

    ): VolumeFilterResult {

        if (candles.length === 0) {

            return {

                passed: false,

                averageVolume: 0,

                latestVolume: 0,

                relativeVolume: 0,

                reason: "No candle data.",

            };

        }

        const averageVolume =

            candles.reduce(

                (sum, candle) =>

                    sum + candle.volume,

                0

            ) / candles.length;

        const latestVolume =

            candles[candles.length - 1].volume;

        const relativeVolume =

            averageVolume === 0

                ? 0

                : latestVolume / averageVolume;

        if (

            options.minimumAverageVolume !== undefined &&

            averageVolume <

                options.minimumAverageVolume

        ) {

            return {

                passed: false,

                averageVolume,

                latestVolume,

                relativeVolume,

                reason:

                    "Average volume below threshold.",

            };

        }

        if (

            options.minimumLatestVolume !== undefined &&

            latestVolume <

                options.minimumLatestVolume

        ) {

            return {

                passed: false,

                averageVolume,

                latestVolume,

                relativeVolume,

                reason:

                    "Latest volume below threshold.",

            };

        }

        if (

            options.minimumRelativeVolume !== undefined &&

            relativeVolume <

                options.minimumRelativeVolume

        ) {

            return {

                passed: false,

                averageVolume,

                latestVolume,

                relativeVolume,

                reason:

                    "Relative volume below threshold.",

            };

        }

        return {

            passed: true,

            averageVolume,

            latestVolume,

            relativeVolume,

        };

    }

}
