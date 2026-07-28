/**
==========================================================
AURA Trade OS
Stochastic Oscillator Indicator
Version : 0.1.0 Alpha
==========================================================
*/


export interface StochasticInput {


    high:number[];


    low:number[];


    close:number[];


}



export interface StochasticConfig {


    period:number;


    signalPeriod:number;

}



export interface StochasticResult {


    k:number;


    d:number;


    timestamp:number;


}





export class StochasticIndicator {



    private config:StochasticConfig;



    constructor(

        config?:Partial<StochasticConfig>

    ){


        this.config={


            period:

                14,


            signalPeriod:

                3,


            ...config

        };

    }





    /**
     * Calculate stochastic
     */
    calculate(

        input:StochasticInput

    ):StochasticResult|null {



        const {

            high,

            low,

            close

        } = input;




        const period =

            this.config.period;



        if(

            high.length < period

            ||

            low.length < period

            ||

            close.length < period

        ){

            return null;

        }





        const recentHigh =

            Math.max(

                ...

                high.slice(

                    -period

                )

            );



        const recentLow =

            Math.min(

                ...

                low.slice(

                    -period

                )

            );



        const currentClose =

            close[

                close.length - 1

            ];





        const range =

            recentHigh -

            recentLow;



        let k = 0;



        if(range !== 0){


            k =

            (

                (

                    currentClose -

                    recentLow

                )

                /

                range

            )

            *

            100;


        }





        const d =

            this.calculateD(

                k

            );





        return {


            k:

                Number(

                    k.toFixed(2)

                ),



            d:

                Number(

                    d.toFixed(2)

                ),



            timestamp:

                Date.now()


        };

    }





    /**
     * Calculate %D
     */
    private calculateD(

        currentK:number

    ){



        /**
         * 
         * Simplified smoothing.
         * 
         * Full implementation
         * will use K history buffer.
         */


        return currentK;

    }





    /**
     * Signal helper
     */
    getSignal(

        result:StochasticResult

    ){



        if(

            result.k < 20

            &&

            result.d < 20

        ){


            return "OVERSOLD";


        }





        if(

            result.k > 80

            &&

            result.d > 80

        ){


            return "OVERBOUGHT";


        }





        return "NEUTRAL";

    }

}




const stochastic =

    new StochasticIndicator();



export default stochastic;
