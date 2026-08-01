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

import type {

    StrategyAction,

    StrategyDecision

} from "../types";



import evaluator, {

    EvaluationResult,

    EvaluationRule

}

from "./evaluator";






export interface StrategyDefinition {


    name:string;


    description:string;


    rules:EvaluationRule[];


    execute?:

    (

        features:IndicatorFeatureVector,

        position:"NONE"|"LONG"

    )=>StrategyAction;


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

        features:IndicatorFeatureVector,

        position:"NONE"|"LONG" = "NONE"

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

            StrategyAction = "HOLD";






        if(

            strategy.execute

        ){


            action =

                strategy.execute(

                    features,

                    position

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

                features.pair ?? "UNKNOWN",



            strategy:

                strategy.name,



            action,



            confidence:

                evaluation.confidence,



            score:

                evaluation.score,



            riskLevel:

                evaluation.confidence >= 70

                    ? "LOW"

                    : evaluation.confidence >= 40

                        ? "MEDIUM"

                        : "HIGH",




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

        features:IndicatorFeatureVector,

        position:"NONE"|"LONG" = "NONE"

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

                    features,

                    position

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

    ):StrategyAction {



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
