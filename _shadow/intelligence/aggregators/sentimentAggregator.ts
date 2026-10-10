/**
==========================================================
AURA Trade OS
Sentiment Aggregator
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    IntelligenceSnapshot,
    SentimentSnapshot,

} from "../types";



export class SentimentAggregator {

    /**
     * Build unified sentiment snapshot.
     */
    aggregate(

        snapshot: IntelligenceSnapshot

    ): SentimentSnapshot {

        const providers =

            snapshot.providers;



        const coinGecko =

            (providers.coingecko ?? {}) as { fearGreed?: number };



        const news =

            (providers.news ?? {}) as { sentiment?: number };



        const social =

            (providers.social ?? {}) as { sentiment?: number };



        const onchain =

            (providers.onchain ?? {}) as { sentiment?: number };



        return {

            timestamp:

                snapshot.timestamp,



            fearGreed:

                coinGecko.fearGreed ??

                null,



            newsSentiment:

                news.sentiment ??

                null,



            socialSentiment:

                social.sentiment ??

                null,



            onchainSentiment:

                onchain.sentiment ??

                null,



            overallScore:

                this.calculateScore({

                    fearGreed:

                        coinGecko.fearGreed,

                    news:

                        news.sentiment,

                    social:

                        social.sentiment,

                    onchain:

                        onchain.sentiment,

                }),



            providers: {

                coingecko:

                    Boolean(

                        providers.coingecko

                    ),

                news:

                    Boolean(

                        providers.news

                    ),

                social:

                    Boolean(

                        providers.social

                    ),

                onchain:

                    Boolean(

                        providers.onchain

                    ),

            },

        };

    }



    /**
     * Calculate overall sentiment.
     */
    private calculateScore(

        values: {

            fearGreed?: number;

            news?: number;

            social?: number;

            onchain?: number;

        }

    ): number | null {

        const scores = [

            values.fearGreed,

            values.news,

            values.social,

            values.onchain,

        ].filter(

            (

                value

            ): value is number =>

                typeof value ===

                "number"

        );



        if (

            scores.length === 0

        ) {

            return null;

        }



        const total =

            scores.reduce(

                (

                    sum,

                    value

                ) =>

                    sum + value,

                0

            );



        return Number(

            (

                total /

                scores.length

            ).toFixed(2)

        );

    }

}



const sentimentAggregator =

    new SentimentAggregator();



export default sentimentAggregator;
