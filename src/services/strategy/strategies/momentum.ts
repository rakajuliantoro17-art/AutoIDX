/**
==========================================================
AURA Trade OS
Momentum Strategy
Version : 0.1.0 Alpha
==========================================================
RSI + Stochastic + MACD Momentum Strategy
==========================================================
*/


import {

    StrategyDefinition

}

from "../core/strategyEngine";



import evaluator, {

    EvaluationRule

}

from "../core/evaluator";





/*
==========================================================
Momentum Entry Rules
==========================================================
*/


const momentumEntryRules:EvaluationRule[] = [





    evaluator.condition(

        "RSI Recovery",

        "RSI recovering from oversold zone",

        0.35,


        (features)=>{


            return (

                features.rsi >=30

                &&

                features.rsi <=55

            );


        }


    ),






    evaluator.condition(

        "Stochastic Bullish Cross",

        "Stochastic K above D",

        0.35,


        (features)=>{


            return (

                features.stochasticK >

                features.stochasticD

            );


        }


    ),






    evaluator.condition(

        "MACD Momentum Positive",

        "MACD above signal",

        0.30,


        (features)=>{


            return (

                features.macd >

                features.macdSignal

            );


        }


    )



];









/*
==========================================================
Momentum Exit Rules
==========================================================
*/


const momentumExitRules:EvaluationRule[] = [





    evaluator.condition(

        "RSI Overbought Exit",

        "RSI above 70",

        0.40,


        (features)=>{


            return (

                features.rsi >=70

            );


        }


    ),






    evaluator.condition(

        "Stochastic Weakness",

        "Stochastic K below D",

        0.30,


        (features)=>{


            return (

                features.stochasticK <

                features.stochasticD

            );


        }


    ),






    evaluator.condition(

        "MACD Momentum Loss",

        "MACD below signal",

        0.30,


        (features)=>{


            return (

                features.macd <

                features.macdSignal

            );


        }


    )



];









const momentumStrategy:StrategyDefinition = {



    name:

        "MOMENTUM",





    description:

        "RSI Stochastic MACD Momentum Strategy",






    rules:

        momentumEntryRules,







    execute:(features)=>{



        /*
        ==================================
        Exit Priority
        ==================================
        */


        const exit =

            evaluator.evaluate(

                features,

                momentumExitRules

            );





        if(

            exit.status === "PASS"

        ){

            return "SELL";

        }







        /*
        ==================================
        Entry
        ==================================
        */


        const entry =

            evaluator.evaluate(

                features,

                momentumEntryRules

            );







        if(

            entry.status === "PASS"

        ){

            return "BUY";

        }






        return "HOLD";


    }



};







export default momentumStrategy;
