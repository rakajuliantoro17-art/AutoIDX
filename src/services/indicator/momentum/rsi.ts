/**
==========================================================
AURA Trade OS
RSI Indicator
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketCandle,

} from "@/services/market";


export interface RSIOptions {

    period?: number;

}


export type RSICondition =

    | "OVERBOUGHT"

    | "OVERSOLD"

    | "NEUTRAL";



export interface RSIResult {


    value: number;


    condition: RSICondition;


    momentum:

        | "BULLISH"

        | "BEARISH"

        | "NEUTRAL";


    timestamp: number;

}



export class RSIIndicator {


    private readonly period: number;



    constructor(

        options: RSIOptions = {}

    ) {


        this.period =

            options.period ?? 14;


    }



    /**
     * Calculate RSI.
     */
    calculate(

        candles: readonly MarketCandle[]

    ): RSIResult {


        const closes =

            candles.map(

                candle => candle.close

            );



        if (

            closes.length <= this.period

        ) {


            return {

                value: 50,

                condition: "NEUTRAL",

                momentum: "NEUTRAL",

                timestamp:

                    Date.now(),

            };

        }



        const changes:number[] = [];



        for (

            let i = 1;

            i < closes.length;

            i++

        ) {


            changes.push(

                closes[i] -

                closes[i - 1]

            );

        }



        let gains = 0;

        let losses = 0;



        for (

            let i = 0;

            i < this.period;

            i++

        ) {


            const change =

                changes[i];



            if (

                change > 0

            ) {


                gains += change;


            }

            else {


                losses +=

                    Math.abs(change);


            }

        }



        let averageGain =

            gains /

            this.period;



        let averageLoss =

            losses /

            this.period;



        for (

            let i = this.period;

            i < changes.length;

            i++

        ) {


            const change =

                changes[i];



            const gain =

                change > 0

                    ? change

                    : 0;



            const loss =

                change < 0

                    ? Math.abs(change)

                    : 0;



            averageGain =

                (

                    averageGain *

                    (

                        this.period - 1

                    )

                    +

                    gain

                )

                /

                this.period;



            averageLoss =

                (

                    averageLoss *

                    (

                        this.period - 1

                    )

                    +

                    loss

                )

                /

                this.period;


        }



        const rs =

            averageLoss === 0

                ? 100

                :

                averageGain /

                averageLoss;



        const rsi =

            100 -

            (

                100 /

                (

                    1 +

                    rs

                )

            );



        return {


            value: rsi,


            condition:

                this.getCondition(

                    rsi

                ),



            momentum:

                this.getMomentum(

                    rsi

                ),



            timestamp:

                candles[

                    candles.length - 1

                ].timestamp,


        };


    }



    /**
     * Determine market condition.
     */
    private getCondition(

        value:number

    ): RSICondition {


        if (

            value >= 70

        ) {

            return "OVERBOUGHT";

        }



        if (

            value <= 30

        ) {

            return "OVERSOLD";

        }



        return "NEUTRAL";

    }



    /**
     * Determine momentum.
     */
    private getMomentum(

        value:number

    ) {


        if (

            value > 55

        ) {

            return "BULLISH";

        }



        if (

            value < 45

        ) {

            return "BEARISH";

        }



        return "NEUTRAL";

    }


}
