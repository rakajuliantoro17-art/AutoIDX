/**
==========================================================
AURA Trade OS
Strategy Entry Rules
Version : 0.1.0 Alpha
==========================================================
BUY Entry Conditions
==========================================================
*/


import evaluator, {

    EvaluationRule

}

from "../core/evaluator";





export const entryRules:EvaluationRule[] = [



    /**
     * EMA Trend Confirmation
     */
    evaluator.condition(

        "EMA Bullish Trend",

        "Fast EMA above Slow EMA",

        0.25,


        (features)=>{


            return (

                features.emaFast >

                features.emaSlow

            );


        }


    ),







    /**
     * MACD Momentum Confirmation
     */
    evaluator.condition(

        "MACD Bullish Confirmation",

        "MACD line above signal line",

        0.25,


        (features)=>{


            return (

                features.macd >

                features.macdSignal

            );


        }


    ),







    /**
     * ADX Trend Strength
     */
    evaluator.condition(

        "ADX Strong Trend",

        "ADX above 25 indicates strong trend",

        0.20,


        (features)=>{


            return (

                features.adx >= 25

            );


        }


    ),







    /**
     * RSI Entry Zone
     */
    evaluator.condition(

        "RSI Healthy Zone",

        "RSI between 35 and 65",

        0.15,


        (features)=>{


            return (

                features.rsi >=35

                &&

                features.rsi <=65

            );


        }


    ),







    /**
     * Stochastic Momentum
     */
    evaluator.condition(

        "Stochastic Bullish Momentum",

        "Stochastic K above D",

        0.15,


        (features)=>{


            return (

                features.stochasticK >

                features.stochasticD

            );


        }


    )



];






export default entryRules;
