/**
==========================================================
AURA Trade OS
Indicator Manager
Version : 0.1.0 Alpha
==========================================================
*/


import indicatorRegistry
from "./registry";


import {
    IndicatorCandle,
    IndicatorFeatureVector,
    IndicatorSnapshot
}
from "./types";





export interface IndicatorCalculationResult {


    features:IndicatorFeatureVector;


    snapshot:IndicatorSnapshot;


    raw:any;


    timestamp:number;


}





export class IndicatorManager {



    private registry;



    constructor(){


        this.registry =

            indicatorRegistry;


    }





    /**
     * Calculate all indicators
     */
    calculate(

        candles:IndicatorCandle[],

        pair:string

    ):IndicatorCalculationResult|null {



        if(

            candles.length < 30

        ){

            return null;

        }





        const close =

            candles.map(

                c => c.close

            );



        const high =

            candles.map(

                c => c.high

            );



        const low =

            candles.map(

                c => c.low

            );





        const volume =

            candles.map(

                c => c.volume

            );





        const latest =

            candles[

                candles.length - 1

            ];





        /**
         * Trend indicators
         */


        const ema =

            this.registry

            .get("EMA")

            ?.instance

            .calculate({

                close

            });





        const macd =

            this.registry

            .get("MACD")

            ?.instance

            .calculate({

                close

            });





        const adx =

            this.registry

            .get("ADX")

            ?.instance

            .calculate({

                high,

                low,

                close

            });







        /**
         * Momentum indicators
         */


        const rsi =

            this.registry

            .get("RSI")

            ?.instance

            .calculate({

                close

            });





        const stochastic =

            this.registry

            .get("STOCHASTIC")

            ?.instance

            .calculate({

                high,

                low,

                close

            });







        /**
         * Volatility
         */


        const atr =

            this.registry

            .get("ATR")

            ?.instance

            .calculate({

                high,

                low,

                close

            });





        const bollinger =

            this.registry

            .get("BOLLINGER")

            ?.instance

            .calculate({

                close

            });









        const features:

            IndicatorFeatureVector = {



            pair,


            price:

                latest.close,


            volume:

                latest.volume,





            emaFast:

                ema?.fast ?? 0,


            emaSlow:

                ema?.slow ?? 0,





            macd:

                macd?.macd ?? 0,


            macdSignal:

                macd?.signal ?? 0,


            macdHistogram:

                macd?.histogram ?? 0,





            adx:

                adx?.adx ?? 0,





            rsi:

                rsi?.value ?? 0,





            stochasticK:

                stochastic?.k ?? 0,


            stochasticD:

                stochastic?.d ?? 0,





            atr:

                atr?.value ?? 0,





            bollingerUpper:

                bollinger?.upper ?? 0,


            bollingerMiddle:

                bollinger?.middle ?? 0,


            bollingerLower:

                bollinger?.lower ?? 0,





            timestamp:

                Date.now()


        };









        const snapshot:

            IndicatorSnapshot = {


            emaFast:

                features.emaFast,


            emaSlow:

                features.emaSlow,



            rsi:

                features.rsi,



            macd:

                features.macd,


            macdSignal:

                features.macdSignal,



            adx:

                features.adx,



            stochasticK:

                features.stochasticK,


            stochasticD:

                features.stochasticD,



            atr:

                features.atr,



            bollingerUpper:

                features.bollingerUpper,


            bollingerLower:

                features.bollingerLower


        };









        return {


            features,


            snapshot,



            raw:{


                ema,


                macd,


                adx,


                rsi,


                stochastic,


                atr,


                bollinger


            },



            timestamp:

                Date.now()


        };

    }





    /**
     * Available indicators
     */
    indicators(){


        return this.registry.list();


    }




}





const indicatorManager =

    new IndicatorManager();




export default indicatorManager;
