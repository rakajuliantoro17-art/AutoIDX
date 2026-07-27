/**
==========================================================
AURA Trade OS
OBV Indicator
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    MarketCandle,

} from "@/services/market";



export interface OBVOptions {


    smoothingPeriod?: number;


}



export type OBVTrend =

    | "ACCUMULATION"

    | "DISTRIBUTION"

    | "NEUTRAL";



export interface OBVResult {


    value:number;


    change:number;


    percentageChange:number;


    trend:OBVTrend;


    timestamp:number;


}



export class OBVIndicator {


    private readonly smoothingPeriod:number;



    constructor(

        options:OBVOptions = {}

    ) {


        this.smoothingPeriod =

            options.smoothingPeriod ?? 5;


    }



    /**
     * Calculate OBV.
     */
    calculate(

        candles: readonly MarketCandle[]

    ):OBVResult {


        const values =

            this.calculateOBV(

                candles

            );



        const current =

            values[

                values.length - 1

            ];



        const previous =

            values[

                values.length - 2

            ]

            ?? current;



        const change =

            current -

            previous;



        const percentageChange =

            previous === 0

                ? 0

                :

                (

                    change /

                    Math.abs(

                        previous

                    )

                )

                *

                100;



        return {


            value:

                current,



            change,



            percentageChange,



            trend:

                this.detectTrend(

                    percentageChange

                ),



            timestamp:

                candles[

                    candles.length - 1

                ].timestamp,


        };


    }



    /**
     * Calculate On Balance Volume.
     */
    private calculateOBV(

        candles: readonly MarketCandle[]

    ):number[] {


        const result:number[] = [

            0

        ];



        for (

            let i = 1;

            i < candles.length;

            i++

        ) {


            const current =

                candles[i];


            const previous =

                candles[i - 1];



            let obv =

                result[i - 1];



            if (

                current.close >

                previous.close

            ) {


                obv +=

                    current.volume;


            }


            else if (

                current.close <

                previous.close

            ) {


                obv -=

                    current.volume;


            }



            result.push(

                obv

            );


        }



        return result;

    }



    /**
     * Detect volume flow.
     */
    private detectTrend(

        change:number

    ):OBVTrend {


        if (

            change > 5

        ) {

            return "ACCUMULATION";

        }



        if (

            change < -5

        ) {

            return "DISTRIBUTION";

        }



        return "NEUTRAL";

    }


}
