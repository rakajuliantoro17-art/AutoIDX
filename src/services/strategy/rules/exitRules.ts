/**
==========================================================
AURA Trade OS
Strategy Exit Rules
Version : 0.1.0 Alpha
==========================================================
SELL / EXIT Conditions
==========================================================
*/


import evaluator, {

    EvaluationRule

}

from "../core/evaluator";





export const exitRules:EvaluationRule[] = [



    /**
     * EMA Bearish Reversal
     */
    evaluator.condition(

        "EMA Bearish Reversal",

        "Fast EMA below Slow EMA",

        0.30,


        (features)=>{


            return (

                features.emaFast <

                features.emaSlow

            );


        }


    ),





    /**
     * MACD Bearish Momentum
     */
    evaluator.condition(

        "MACD Bearish Confirmation",

        "MACD below signal line",

        0.25,


        (features)=>{


            return (

                features.macd <

                features.macdSignal

            );


        }


    ),





    /**
     * RSI Overbought
     */
    evaluator.condition(

        "RSI Overbought",

        "RSI above 70",

        0.20,


        (features)=>{


            return (

                features.rsi >=70

            );


        }


    ),





    /**
     * Stochastic Weakness
     */
    evaluator.condition(

        "Stochastic Bearish Momentum",

        "Stochastic K below D",

        0.15,


        (features)=>{


            return (

                features.stochasticK <

                features.stochasticD

            );


        }


    ),





    /**
     * Trend Loss
     */
    evaluator.condition(

        "ADX Trend Weakness",

        "ADX below 20",

        0.10,


        (features)=>{


            return (

                features.adx <20

            );


        }


    )


];






export default exitRules;
