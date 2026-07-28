/**
==========================================================
AURA Trade OS
Strategy Engine Core
Version : 0.1.0 Alpha
==========================================================
*/


import {


    IndicatorFeatureVector


}

from "@/services/indicators";



import evaluator, {

    EvaluationResult,

    EvaluationRule

}

from "./evaluator";






export type TradeAction =


    | "BUY"

    | "SELL"

    | "HOLD";







export interface StrategyDefinition {


    name:string;


    description:string;


    rules:EvaluationRule[];


    execute?:

    (

        features:IndicatorFeatureVector

    )=>TradeAction;


}







export interface StrategyDecision {


    pair:string;


    strategy:string;


    action:TradeAction;


    confidence:number;


    score:number;


    evaluation:EvaluationResult;


    reasons:string[];


    timestamp:number;


}







export class StrategyEngine {



    private strategies:

        Map<string,StrategyDefinition>;





    constructor(){


        this.strategies =

            new Map();


    }







    /**
     * Register strategy
     */
    register(

        strategy:StrategyDefinition

    ){



        this.strategies.set(

            strategy.name,

            strategy

        );


    }







    /**
     * Execute strategy
     */
    evaluate(

        strategyName:string,

        features:IndicatorFeatureVector

    ):StrategyDecision|null {



        const strategy =

            this.strategies.get(

                strategyName

            );





        if(!strategy){


            return null;


        }





        const evaluation =

            evaluator.evaluate(

                features,

                strategy.rules

            );








        let action:

            TradeAction = "HOLD";






        if(

            strategy.execute

        ){


            action =

                strategy.execute(

                    features

                );


        }

        else{



            action =

                this.defaultDecision(

                    evaluation

                );


        }







        return {


            pair:

                features.pair,



            strategy:

                strategy.name,



            action,



            confidence:

                evaluation.confidence,



            score:

                evaluation.score,



            evaluation,



            reasons:[

                ...evaluation.passed,

                ...evaluation.failed

            ],



            timestamp:

                Date.now()


        };


    }








    /**
     * Evaluate all strategies
     */
    evaluateAll(

        features:IndicatorFeatureVector

    ){



        const results:

            StrategyDecision[]=[];





        for(

            const name of

            this.strategies.keys()

        ){



            const result =

                this.evaluate(

                    name,

                    features

                );



            if(result)

                results.push(result);


        }



        return results;


    }








    /**
     * Default decision
     */
    private defaultDecision(

        evaluation:EvaluationResult

    ):TradeAction {



        if(

            evaluation.status === "PASS"

        ){


            return "BUY";


        }





        if(

            evaluation.status === "FAIL"

        ){


            return "HOLD";


        }





        return "HOLD";


    }




}







const strategyEngine =

    new StrategyEngine();





export default strategyEngine;
