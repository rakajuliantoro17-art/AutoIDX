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



        const coinStatsRaw =

            providers.coinstats ?? {};

        const coinStats = coinStatsRaw as {
            assets?: PortfolioAsset[];
            portfolioValue?: number;
            totalPnL?: number;
            totalPnLPercent?: number;
        };



        const zerionRaw =

            providers.zerion ?? {};

        const zerion = zerionRaw as {
            assets?: PortfolioAsset[];
            portfolioValue?: number;
            totalPnL?: number;
            totalPnLPercent?: number;
        };



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
     * Merge duplicated assets by symbol.
     * Ditulis tanpa generic angle-bracket syntax
     * (Map/Array<...>) supaya aman dari masalah
     * copy-paste yang menghilangkan tanda kurung siku.
     */
    private mergeAssets(

        sourceA: PortfolioAsset[] | undefined,

        sourceB: PortfolioAsset[] | undefined

    ): PortfolioAsset[] {

        const combined: PortfolioAsset[] = [];

        if (sourceA) {

            for (const asset of sourceA) {

                combined.push(asset);

            }

        }

        if (sourceB) {

            for (const asset of sourceB) {

                combined.push(asset);

            }

        }

        const seenSymbols: string[] = [];

        const result: PortfolioAsset[] = [];

        for (

            let i = combined.length - 1;

            i >= 0;

            i--

        ) {

            const asset = combined[i];

            if (seenSymbols.indexOf(asset.symbol) === -1) {

                seenSymbols.push(asset.symbol);

                result.unshift(asset);

            }

        }

        return result;

    }

}



const portfolioAggregator =

    new PortfolioAggregator();



export default portfolioAggregator;
