/**
==========================================================
AURA Trade OS
Market Snapshot
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    TickerSnapshot,

    OrderBookSnapshot,

} from "@/services/market/snapshots";

import type {

    CandleStatistics,

    VolumeStatistics,

    TradeStatistics,

    OrderBookStatistics,

} from "@/services/market/aggregators";


import type {

    VolumeFilterResult,

    VolatilityFilterResult,

    SpreadFilterResult,

    LiquidityFilterResult,

} from "@/services/market/filters";


export interface MarketSnapshotData {

    symbol: string;

    timestamp: number;


    ticker?: TickerSnapshot;


    orderBook?: OrderBookSnapshot;


    candle?: CandleStatistics;


    volume?: VolumeStatistics;


    trade?: TradeStatistics;


    orderBookStats?: OrderBookStatistics;


    filters: {

        volume?: VolumeFilterResult;

        volatility?: VolatilityFilterResult;

        spread?: SpreadFilterResult;

        liquidity?: LiquidityFilterResult;

    };

}


export class MarketSnapshot {


    private constructor(

        readonly data: MarketSnapshotData

    ) {}


    /**
     * Create market snapshot.
     */
    static create(

        data: MarketSnapshotData

    ): MarketSnapshot {

        return new MarketSnapshot({

            ...data,

            timestamp:

                data.timestamp ??

                Date.now(),

            filters: {

                ...data.filters,

            },

        });

    }


    /**
     * Returns trading symbol.
     */
    symbol(): string {

        return this.data.symbol;

    }


    /**
     * Returns snapshot timestamp.
     */
    timestamp(): number {

        return this.data.timestamp;

    }


    /**
     * Check market health.
     */
    isHealthy(): boolean {


        const filters =

            this.data.filters;


        const results = [

            filters.volume,

            filters.volatility,

            filters.spread,

            filters.liquidity,

        ];


        return results

            .filter(Boolean)

            .every(

                filter =>

                    filter!.passed

            );

    }


    /**
     * Returns market confidence score.
     */
    confidenceScore(): number {


        const filters =

            this.data.filters;


        const checks = [

            filters.volume,

            filters.volatility,

            filters.spread,

            filters.liquidity,

        ]

        .filter(Boolean);


        if (checks.length === 0) {

            return 0;

        }


        const passed =

            checks.filter(

                item => item!.passed

            ).length;


        return (

            passed /

            checks.length

        ) * 100;

    }


    /**
     * Export raw snapshot.
     */
    toJSON(): MarketSnapshotData {

        return {

            ...this.data,

        };

    }


}
