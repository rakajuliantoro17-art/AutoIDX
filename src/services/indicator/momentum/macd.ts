/**
==========================================================
AURA Trade OS
MACD Indicator
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketCandle,

} from "@/services/market";


export interface MACDOptions {

    fastPeriod?: number;

    slowPeriod?: number;

    signalPeriod?: number;

}


export interface MACDPoint {

    timestamp: number;

    macd: number;

    signal: number;

    histogram: number;

}


export interface MACDResult {

    values: MACDPoint[];

    current: MACDPoint;

    trend: "BULLISH" | "BEARISH" | "NEUTRAL";

    crossover:

        | "GOLDEN_CROSS"

        | "DEATH_CROSS"

        | "NONE";

}



/**
 * MACD Calculator
 */
export class MACDIndicator {


    private readonly fastPeriod: number;

    private readonly slowPeriod: number;

    private readonly signalPeriod: number;



    constructor(

        options: MACDOptions = {}

    ) {

        this.fastPeriod =

            options.fastPeriod ?? 12;


        this.slowPeriod =

            options.slowPeriod ?? 26;


        this.signalPeriod =

            options.signalPeriod ?? 9;

    }



    /**
     * Calculate MACD.
     */
    calculate(

        candles: readonly MarketCandle[]

    ): MACDResult {


        const closes = candles.map(

            candle => candle.close

        );


        const fastEMA =

            this.calculateEMA(

                closes,

                this.fastPeriod

            );


        const slowEMA =

            this.calculateEMA(

                closes,

                this.slowPeriod

            );



        const macdLine:number[] = [];


        for (

            let i = 0;

            i < closes.length;

            i++

        ) {


            if (

                fastEMA[i] === undefined ||

                slowEMA[i] === undefined

            ) {

                continue;

            }


            macdLine.push(

                fastEMA[i] -

                slowEMA[i]

            );

        }



        const signalLine =

            this.calculateEMA(

                macdLine,

                this.signalPeriod

            );



        const values: MACDPoint[] = [];



        for (

            let i = 0;

            i < signalLine.length;

            i++

        ) {


            const macd =

                macdLine[i +

                    (

                        macdLine.length -

                        signalLine.length

                    )

                ];



            const signal =

                signalLine[i];



            values.push({

                timestamp:

                    candles[

                        candles.length -

                        signalLine.length +

                        i

                    ].timestamp,


                macd,


                signal,


                histogram:

                    macd -

                    signal,

            });

        }



        const current =

            values[

                values.length - 1

            ];



        return {

            values,

            current,

            trend:

                current.macd >

                current.signal

                    ? "BULLISH"

                    : current.macd <

                      current.signal

                        ? "BEARISH"

                        : "NEUTRAL",


            crossover:

                this.detectCrossover(

                    values

                ),

        };

    }



    /**
     * Calculate EMA.
     */
    private calculateEMA(

        values:number[],

        period:number

    ):number[] {


        if (

            values.length < period

        ) {

            return [];

        }


        const multiplier =

            2 /

            (

                period + 1

            );


        const ema:number[] = [];



        let previous =

            values

                .slice(

                    0,

                    period

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

                period;



        ema.push(previous);



        for (

            let i = period;

            i < values.length;

            i++

        ) {


            previous =

                (

                    values[i] -

                    previous

                )

                *

                multiplier

                +

                previous;


            ema.push(previous);

        }


        return ema;

    }



    /**
     * Detect MACD crossover.
     */
    private detectCrossover(

        values: MACDPoint[]

    ):


        | "GOLDEN_CROSS"

        | "DEATH_CROSS"

        | "NONE" {


        if (

            values.length < 2

        ) {

            return "NONE";

        }


        const previous =

            values[

                values.length - 2

            ];


        const current =

            values[

                values.length - 1

            ];



        if (

            previous.macd <= previous.signal &&

            current.macd > current.signal

        ) {

            return "GOLDEN_CROSS";

        }



        if (

            previous.macd >= previous.signal &&

            current.macd < current.signal

        ) {

            return "DEATH_CROSS";

        }


        return "NONE";

    }

}
