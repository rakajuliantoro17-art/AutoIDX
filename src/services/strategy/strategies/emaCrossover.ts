/**
==========================================================
AURA Trade OS
EMA Crossover Strategy
Version : 0.1.0 Alpha
==========================================================
Simple Trend Following Strategy
==========================================================
*/


import {

    StrategyDefinition

}

from "../core/strategyEngine";



import evaluator

from "../core/evaluator";



import {

    EvaluationRule

}

from "../core/evaluator";







/**
==========================================================
EMA Entry Rules
==========================================================
*/


const emaEntryRules:EvaluationRule[] = [



    evaluator.condition(

        "EMA Golden Cross",

        "Fast EMA above Slow EMA",

        1,


        (features)=>{


            return (

                features.emaFast > features.emaSlow

            );


        }


    )



];







/**
==========================================================
EMA Exit Rules
==========================================================
*/


const emaExitRules:EvaluationRule[] = [



    evaluator.condition(

        "EMA Death Cross",

        "Fast EMA below Slow EMA",

        1,


        (features)=>{


            return (

                features.emaFast < features.emaSlow

            );


        }


    )



];







const emaCrossover:StrategyDefinition = {



    name:

        "EMA_CROSSOVER",




    description:

        "Simple EMA Fast Slow Trend Following Strategy",




    rules:

        emaEntryRules,





    execute:(features, position)=>{



        /**
         * PENGAMAN POSITION-AWARENESS:
         * jangan pernah SELL kalau tidak sedang
         * punya posisi (position !== "LONG").
         */
        if(

            position === "LONG"

        ){

            const exit =

                evaluator.evaluate(

                    features,

                    emaExitRules

                );

            if(

                exit.status === "PASS"

            ){

                return "SELL";

            }

        }





        const entry =

            evaluator.evaluate(

                features,

                emaEntryRules

            );




        if(

            entry.status === "PASS"

        ){

            return "BUY";

        }




        return "HOLD";


    }



};






export default emaCrossover;
