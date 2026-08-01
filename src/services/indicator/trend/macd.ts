/**
==========================================================
AURA Trade OS
MACD Indicator Engine
Version : 0.1.0 Alpha
==========================================================
*/


export interface MACDInput {


    close:number[];


}



export interface MACDConfig {


    fastPeriod:number;


    slowPeriod:number;


    signalPeriod:number;

}




export interface MACDResult {


    macd:number;


    signal:number;


    histogram:number;


    trend:

        | "BULLISH"

        | "BEARISH"

        | "NEUTRAL";


    timestamp:number;

}




export class MACDIndicator {



    private config:MACDConfig;




    constructor(

        config?:Partial<MACDConfig>

    ){


        this.config={


            fastPeriod:12,


            slowPeriod:26,


            signalPeriod:9,


            ...config


        };


    }





    calculate(

        input:MACDInput

    ):MACDResult|null {



        const prices =

            input.close;



        if(

            prices.length <

            this.config.slowPeriod

        ){

            return null;

        }




        const fastEMA =

            this.calculateEMA(

                prices,

                this.config.fastPeriod

            );



        const slowEMA =

            this.calculateEMA(

                prices,

                this.config.slowPeriod

            );



        const macdLine =

            fastEMA -

            slowEMA;





        /**
         * Simplified signal EMA
         * menggunakan MACD history
         */
        const signalLine =

            this.calculateSignal(

                prices

            );





        const histogram =

            macdLine -

            signalLine;





        return {


            macd:

                Number(

                    macdLine.toFixed(4)

                ),



            signal:

                Number(

                    signalLine.toFixed(4)

                ),



            histogram:

                Number(

                    histogram.toFixed(4)

                ),



            trend:

                this.detectTrend(

                    macdLine,

                    signalLine,

                    histogram

                ),



            timestamp:

                Date.now()

        };


    }





    /**
     * EMA calculation
     */
    private calculateEMA(

        values:number[],

        period:number

    ){



        const multiplier =

            2 /

            (

                period +

                1

            );



        let ema =

            values[0];




        for(

            let i=1;

            i<values.length;

            i++

        ){


            ema =

            (

                values[i]

                *

                multiplier

            )

            +

            (

                ema

                *

                (

                    1 -

                    multiplier

                )

            );


        }



        return ema;

    }





    /**
     * Signal line approximation
     */
    private calculateSignal(

        prices:number[]

    ){



        const macdValues:number[]=[];



        for(

            let i=

            this.config.slowPeriod;

            i<prices.length;

            i++

        ){



            const slice =

                prices.slice(

                    0,

                    i+1

                );



            const fast =

                this.calculateEMA(

                    slice,

                    this.config.fastPeriod

                );



            const slow =

                this.calculateEMA(

                    slice,

                    this.config.slowPeriod

                );



            macdValues.push(

                fast - slow

            );

        }




        if(

            macdValues.length===0

        ){

            return 0;

        }




        return this.calculateEMA(

            macdValues,

            this.config.signalPeriod

        );

    }





    /**
     * Trend detection
     */
    private detectTrend(

        macd:number,

        signal:number,

        histogram:number

    ){



        if(

            macd > signal

            &&

            histogram > 0

        ){

            return "BULLISH";

        }




        if(

            macd < signal

            &&

            histogram < 0

        ){

            return "BEARISH";

        }



        return "NEUTRAL";


    }


}





const macd = new MACDIndicator();
export default macd;
