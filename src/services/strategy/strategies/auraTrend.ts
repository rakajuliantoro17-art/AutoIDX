/**
==========================================================
AURA Trade OS
AURA Trend Strategy
Version : 0.1.0 Alpha
==========================================================
EMA + MACD + ADX + RSI + Stochastic Strategy
==========================================================
*/


import {

    StrategyDefinition,

    TradeAction

}

from "../core/strategyEngine";



import evaluator

from "../core/evaluator";



import {

    entryRules

}

from "../rules/entryRules";



import {

    exitRules

}

from "../rules/exitRules";



import {

    filterRules

}

from "../rules/filterRules";



import strategyScore

from "../scoring/strategyScore";







export interface AuraTrendContext {


    position:

        | "NONE"

        | "LONG";


}







const auraTrend:StrategyDefinition = {



    name:

        "AURA_TREND",





    description:

        "EMA MACD ADX RSI Hybrid Trend Strategy",





    rules:[

        ...filterRules,

        ...entryRules

    ],






    execute:(features)=>{





        /**
         * Market Filter
         */
        const filter =

            evaluator.evaluate(

                features,

                filterRules

            );





        if(

            filter.status !== "PASS"

        ){

            return "HOLD";

        }







        /**
         * Exit Priority
         */
        const exit =

            evaluator.evaluate(

                features,

                exitRules

            );





        if(

            exit.status === "PASS"

        ){

            return "SELL";

        }








        /**
         * Entry Evaluation
         */
        const entry =

            evaluator.evaluate(

                features,

                entryRules

            );







        const score =

            strategyScore.calculate(

                features

            );







        if(

            entry.status === "PASS"

            &&

            score.score >=0.70

        ){

            return "BUY";

        }






        return "HOLD";

    }



};






export default auraTrend;
