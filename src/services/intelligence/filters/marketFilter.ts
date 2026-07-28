/**
==========================================================
AURA Trade OS
Market Filter
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    MarketSnapshot,

} from "../types";



export interface MarketFilterOptions {

    minimumFearGreed?: number;

    maximumFearGreed?: number;

    minimumMarketCap?: number;

    minimumVolume?: number;

    requireTrending?: boolean;

}



export interface MarketFilterResult {

    passed: boolean;

    reasons: string[];

}



export class MarketFilter {

    filter(

        snapshot: MarketSnapshot,

        options: MarketFilterOptions

    ): MarketFilterResult {

        const reasons: string[] = [];



        /*
        ==========================================
        Fear & Greed
        ==========================================
        */

        if (

            options.minimumFearGreed !== undefined &&

            snapshot.fearGreed !== null &&

            snapshot.fearGreed <

            options.minimumFearGreed

        ) {

            reasons.push(

                "Fear & Greed below minimum threshold."

            );

        }



        if (

            options.maximumFearGreed !== undefined &&

            snapshot.fearGreed !== null &&

            snapshot.fearGreed >

            options.maximumFearGreed

        ) {

            reasons.push(

                "Fear & Greed above maximum threshold."

            );

        }



        /*
        ==========================================
        Market Cap
        ==========================================
        */

        if (

            options.minimumMarketCap !== undefined &&

            snapshot.marketCap !== null &&

            snapshot.marketCap <

            options.minimumMarketCap

        ) {

            reasons.push(

                "Market capitalization below minimum."

            );

        }



        /*
        ==========================================
        Volume
        ==========================================
        */

        if (

            options.minimumVolume !== undefined &&

            snapshot.totalVolume !== null &&

            snapshot.totalVolume <

            options.minimumVolume

        ) {

            reasons.push(

                "Trading volume below minimum."

            );

        }



        /*
        ==========================================
        Trending
        ==========================================
        */

        if (

            options.requireTrending &&

            snapshot.trendingCoins.length === 0

        ) {

            reasons.push(

                "No trending assets available."

            );

        }



        return {

            passed:

                reasons.length === 0,

            reasons,

        };

    }

}



const marketFilter =

    new MarketFilter();



export default marketFilter;
