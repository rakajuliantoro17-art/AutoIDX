/**
==========================================================
AURA Trade OS
EMA Indicator
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketCandle,

} from "@/services/market";


export interface EMAOptions {

    period?: number;

}


export type EMATrend =

    | "BULLISH"

    | "BEARISH"

    | "NEUTRAL";



export interface EMAResult {

    value: number;

    period: number;

    trend: EMATrend;

    timestamp: number;

}



export class EMAIndicator {


    private readonly period:number;



    constructor(

        options: EMAOptions = {}

    ) {


        this.period =

            options.period ?? 20;


    }



    /**
     * Calculate EMA.
     */
    calculate(

        candles: readonly MarketCandle[]

    ): EMAResult {


        const closes =

            candles.map(

                candle => candle.close

            );



        const emaValues =

            this.calculateEMA(

                closes

            );



        const currentEMA =

            emaValues[

                emaValues.length - 1

            ];



        const currentPrice =

            closes[

                closes.length - 1

            ];



        return {


            value:

                currentEMA,


            period:

                this.period,



            trend:

                this.detectTrend(

                    currentPrice,

                    currentEMA

                ),



            timestamp:

                candles[

                    candles.length - 1

                ].timestamp,


        };


    }



    /**
     * EMA calculation.
     */
    private calculateEMA(

        values:number[]

    ):number[] {


        if (

            values.length < this.period

        ) {

            return [];

        }



        const multiplier =

            2 /

            (

                this.period + 1

            );



        const ema:number[] = [];



        let previousEMA =

            values

                .slice(

                    0,

                    this.period

                )

                .reduce(

                    (

                        total,

                        value

                    ) =>

                        total + value,

                    0

                )

                /

                this.period;



        ema.push(

            previousEMA

        );



        for (

            let i = this.period;

            i < values.length;

            i++

        ) {


            previousEMA =

                (

                    (

                        values[i] -

                        previousEMA

                    )

                    *

                    multiplier

                )

                +

                previousEMA;



            ema.push(

                previousEMA

            );


        }



        return ema;

    }



    /**
     * Detect trend direction.
     */
    private detectTrend(

        price:number,

        ema:number

    ):EMATrend {


        const difference =

            (

                price -

                ema

            )

            /

            ema

            *

            100;



        if (

            difference > 1

        ) {

            return "BULLISH";

        }



        if (

            difference < -1

        ) {

            return "BEARISH";

        }



        return "NEUTRAL";

    }


}
