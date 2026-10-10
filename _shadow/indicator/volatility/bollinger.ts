/**
==========================================================
AURA Trade OS
Bollinger Bands Indicator
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketCandle,

} from "@/services/market";



export interface BollingerOptions {

    period?: number;

    deviation?: number;

}



export type BollingerPosition =

    | "ABOVE_UPPER"

    | "UPPER_ZONE"

    | "MIDDLE"

    | "LOWER_ZONE"

    | "BELOW_LOWER";



export type BollingerSignal =

    | "BREAKOUT_UP"

    | "BREAKOUT_DOWN"

    | "MEAN_REVERSION_BUY"

    | "MEAN_REVERSION_SELL"

    | "NONE";



export interface BollingerResult {


    middle: number;


    upper: number;


    lower: number;


    bandwidth: number;


    percentB: number;


    position: BollingerPosition;


    signal: BollingerSignal;


    timestamp: number;

}



export class BollingerBandsIndicator {


    private readonly period:number;


    private readonly deviation:number;



    constructor(

        options:BollingerOptions = {}

    ) {


        this.period =

            options.period ?? 20;



        this.deviation =

            options.deviation ?? 2;


    }



    /**
     * Calculate Bollinger Bands.
     */
    calculate(

        candles: readonly MarketCandle[]

    ):BollingerResult {


        const closes =

            candles.map(

                candle => candle.close

            );



        const slice =

            closes.slice(

                closes.length -

                this.period

            );



        const middle =

            this.average(

                slice

            );



        const standardDeviation =

            this.standardDeviation(

                slice,

                middle

            );



        const upper =

            middle +

            (

                standardDeviation *

                this.deviation

            );



        const lower =

            middle -

            (

                standardDeviation *

                this.deviation

            );



        const currentPrice =

            closes[

                closes.length - 1

            ];



        const bandwidth =

            (

                upper -

                lower

            )

            /

            middle;



        const percentB =

            (

                currentPrice -

                lower

            )

            /

            (

                upper -

                lower

            );



        return {


            middle,


            upper,


            lower,


            bandwidth,


            percentB,



            position:

                this.detectPosition(

                    currentPrice,

                    upper,

                    middle,

                    lower

                ),



            signal:

                this.detectSignal(

                    currentPrice,

                    upper,

                    lower,

                    percentB

                ),



            timestamp:

                candles[

                    candles.length - 1

                ].timestamp,


        };


    }



    /**
     * Calculate average.
     */
    private average(

        values:number[]

    ):number {


        return (

            values.reduce(

                (

                    sum,

                    value

                ) =>

                    sum + value,

                0

            )

            /

            values.length

        );

    }



    /**
     * Calculate standard deviation.
     */
    private standardDeviation(

        values:number[],

        mean:number

    ):number {


        const variance =

            values.reduce(

                (

                    total,

                    value

                ) => {


                    return total +

                        Math.pow(

                            value - mean,

                            2

                        );


                },

                0

            )

            /

            values.length;



        return Math.sqrt(

            variance

        );

    }



    /**
     * Detect price position.
     */
    private detectPosition(

        price:number,

        upper:number,

        middle:number,

        lower:number

    ):BollingerPosition {


        if (

            price > upper

        ) {

            return "ABOVE_UPPER";

        }



        if (

            price > middle

        ) {

            return "UPPER_ZONE";

        }



        if (

            price < lower

        ) {

            return "BELOW_LOWER";

        }



        if (

            price < middle

        ) {

            return "LOWER_ZONE";

        }



        return "MIDDLE";

    }



    /**
     * Detect trading signal.
     */
    private detectSignal(

        price:number,

        upper:number,

        lower:number,

        percentB:number

    ):BollingerSignal {


        if (

            price > upper

        ) {

            return "BREAKOUT_UP";

        }



        if (

            price < lower

        ) {

            return "BREAKOUT_DOWN";

        }



        if (

            percentB < 0.05

        ) {

            return "MEAN_REVERSION_BUY";

        }



        if (

            percentB > 0.95

        ) {

            return "MEAN_REVERSION_SELL";

        }



        return "NONE";

    }


}


const bollinger = new BollingerBandsIndicator();
export default bollinger;
