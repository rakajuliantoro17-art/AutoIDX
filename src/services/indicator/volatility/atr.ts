/**
==========================================================
AURA Trade OS
ATR Indicator
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketCandle,

} from "@/services/market";



export interface ATROptions {

    period?: number;

}



export type ATRVolatility =

    | "LOW"

    | "NORMAL"

    | "HIGH"

    | "EXTREME";



export interface ATRResult {


    value: number;


    percentage: number;


    period: number;


    volatility: ATRVolatility;


    timestamp: number;

}



export class ATRIndicator {


    private readonly period:number;



    constructor(

        options:ATROptions = {}

    ) {


        this.period =

            options.period ?? 14;


    }



    /**
     * Calculate ATR.
     */
    calculate(

        candles: readonly MarketCandle[]

    ): ATRResult {


        const trueRanges =

            this.calculateTrueRange(

                candles

            );



        const atrValues =

            this.calculateAverage(

                trueRanges

            );



        const currentATR =

            atrValues[

                atrValues.length - 1

            ];



        const currentPrice =

            candles[

                candles.length - 1

            ].close;



        const percentage =

            (

                currentATR /

                currentPrice

            )

            *

            100;



        return {


            value:

                currentATR,



            percentage,



            period:

                this.period,



            volatility:

                this.detectVolatility(

                    percentage

                ),



            timestamp:

                candles[

                    candles.length - 1

                ].timestamp,


        };


    }



    /**
     * Calculate True Range.
     */
    private calculateTrueRange(

        candles: readonly MarketCandle[]

    ): number[] {


        const ranges:number[] = [];



        for (

            let i = 1;

            i < candles.length;

            i++

        ) {


            const current =

                candles[i];


            const previous =

                candles[i - 1];



            const highLow =

                current.high -

                current.low;



            const highClose =

                Math.abs(

                    current.high -

                    previous.close

                );



            const lowClose =

                Math.abs(

                    current.low -

                    previous.close

                );



            ranges.push(

                Math.max(

                    highLow,

                    highClose,

                    lowClose

                )

            );


        }



        return ranges;

    }



    /**
     * Calculate moving average ATR.
     */
    private calculateAverage(

        values:number[]

    ):number[] {


        if (

            values.length < this.period

        ) {

            return [];

        }



        const result:number[] = [];



        let previousATR =

            values

                .slice(

                    0,

                    this.period

                )

                .reduce(

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

            previousATR

        );



        for (

            let i = this.period;

            i < values.length;

            i++

        ) {


            previousATR =

                (

                    (

                        previousATR *

                        (

                            this.period - 1

                        )

                    )

                    +

                    values[i]

                )

                /

                this.period;



            result.push(

                previousATR

            );

        }



        return result;

    }



    /**
     * Classify volatility.
     */
    private detectVolatility(

        percentage:number

    ):ATRVolatility {


        if (

            percentage < 1

        ) {

            return "LOW";

        }



        if (

            percentage < 3

        ) {

            return "NORMAL";

        }



        if (

            percentage < 6

        ) {

            return "HIGH";

        }



        return "EXTREME";

    }


}
