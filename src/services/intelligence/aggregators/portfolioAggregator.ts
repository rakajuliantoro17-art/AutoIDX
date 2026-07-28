/**
==========================================================
AURA Trade OS
Portfolio Aggregator
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    IntelligenceSnapshot,

    PortfolioSnapshot,

    PortfolioAsset,

} from "../types";



export class PortfolioAggregator {

    /**
     * Build unified portfolio snapshot.
     */
    aggregate(

        snapshot: IntelligenceSnapshot

    ): PortfolioSnapshot {

        const providers =

            snapshot.providers;



        const coinStats =

            providers.coinstats ?? {};



        const zerion =

            providers.zerion ?? {};



        const assets =

            this.mergeAssets(

                coinStats.assets,

                zerion.assets

            );



        return {

            timestamp:

                snapshot.timestamp,



            totalValue:

                coinStats.portfolioValue ??

                zerion.portfolioValue ??

                0,



            totalPnL:

                coinStats.totalPnL ??

                zerion.totalPnL ??

                0,



            totalPnLPercent:

                coinStats.totalPnLPercent ??

                zerion.totalPnLPercent ??

                0,



            assets,



            providers: {

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



    /**
     * Merge duplicated assets.
     */
    private mergeAssets(

        ...sources:

        Array<

            PortfolioAsset[] |

            undefined

        >

    ): PortfolioAsset[] {

        const map =

            new Map<

                string,

                PortfolioAsset

            >();



        for (

            const source of sources

        ) {

            if (!source) {

                continue;

            }



            for (

                const asset of source

            ) {

                map.set(

                    asset.symbol,

                    asset

                );

            }

        }



        return [

            ...map.values()

        ];

    }

}



const portfolioAggregator =

    new PortfolioAggregator();



export default portfolioAggregator;
