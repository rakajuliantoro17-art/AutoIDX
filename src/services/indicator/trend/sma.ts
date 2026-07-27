/**
==========================================================
AURA Trade OS
SMA Indicator
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketCandle,

} from "@/services/market";



export interface SMAOptions {

    period?: number;

}



export type SMATrend =

    | "BULLISH"

    | "BEARISH"

    | "NEUTRAL";



export interface SMAResult {

    value: number;

    period: number;

    trend: SMATrend;

    distancePercent: number;

    timestamp: number;

}



export class SMAIndicator {


    private readonly period:number;



    constructor(

        options:SMAOptions = {}

    ) {


        this.period =

            options.period ?? 20;


    }



    /**
     * Calculate SMA.
     */
    calculate(

        candles: readonly MarketCandle[]

    ):SMAResult {


        const closes =

            candles.map(

                candle => candle.close

            );



        const smaValues =

            this.calculateSMA(

                closes

            );



        const currentSMA =

            smaValues[

                smaValues.length - 1

            ];



        const currentPrice =

            closes[

                closes.length - 1

            ];



        const distancePercent =

            (

                (

                    currentPrice -

                    currentSMA

                )

                /

                currentSMA

            )

            *

            100;



        return {


            value:

                currentSMA,


            period:

                this.period,



            trend:

                this.detectTrend(

                    distancePercent

                ),



            distancePercent,



            timestamp:

                candles[

                    candles.length - 1

                ].timestamp,


        };


    }



    /**
     * Calculate SMA values.
     */
    private calculateSMA(

        values:number[]

    ):number[] {


        if (

            values.length < this.period

        ) {

            return [];

        }



        const result:number[] = [];



        for (

            let i = 0;

            i <= values.length - this.period;

            i++

        ) {


            const slice =

                values.slice(

                    i,

                    i + this.period

                );



            const average =

                slice.reduce(

                    (

                        sum,

                        value

                    ) =>

                        sum + value,

                    0

                )

                /

                this.period;



            result.push(

                average

            );


        }



        return result;

    }



    /**
     * Detect trend direction.
     */
    private detectTrend(

        distancePercent:number

    ):SMATrend {


        if (

            distancePercent > 1

        ) {

            return "BULLISH";

        }



        if (

            distancePercent < -1

        ) {

            return "BEARISH";

        }



        return "NEUTRAL";

    }


}
