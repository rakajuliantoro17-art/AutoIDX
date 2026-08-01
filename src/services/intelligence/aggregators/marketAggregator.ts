/**
==========================================================
AURA Trade OS
Market Aggregator
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    IntelligenceSnapshot,

    MarketSnapshot,

} from "../types";



export class MarketAggregator {

    /**
     * Build unified market snapshot.
     */
    aggregate(

        snapshot: IntelligenceSnapshot

    ): MarketSnapshot {

        const providers =

            snapshot.providers;



        const coinGecko =
            (providers.coingecko ?? {}) as {
                marketCap?: number;
                btcDominance?: number;
                fearGreed?: number;
                trendingCoins?: string[];
                totalVolume?: number;
            };

        const coinStats =
            (providers.coinstats ?? {}) as {
                portfolioValue?: number;
                assets?: unknown[];
            };

        const zerion =
            (providers.zerion ?? {}) as {
                portfolioValue?: number;
                assets?: unknown[];
            };



        return {

            timestamp:

                snapshot.timestamp,



            marketCap:

                coinGecko.marketCap ??

                null,



            btcDominance:

                coinGecko.btcDominance ??

                null,



            fearGreed:

                coinGecko.fearGreed ??

                null,



            trendingCoins:

                coinGecko.trendingCoins ??

                [],



            totalVolume:

                coinGecko.totalVolume ??

                null,



            portfolioValue:

                coinStats.portfolioValue ??

                zerion.portfolioValue ??

                null,



            assets:

                coinStats.assets ??

                zerion.assets ??

                [],



            providers: {

                coingecko:

                    Boolean(

                        providers.coingecko

                    ),

                coinstats:

                    Boolean(

                        providers.coinstats

                    ),

                zerion:

                    Boolean(

                        providers.zerion

                    ),

            },

        };

    }

}



const marketAggregator =

    new MarketAggregator();



export default marketAggregator;
