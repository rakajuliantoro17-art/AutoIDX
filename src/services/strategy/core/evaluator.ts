/**
==========================================================
AURA Trade OS
Strategy Evaluator
Version : 0.1.0 Alpha
==========================================================
*/


import {

    IndicatorFeatureVector

}
from "@/services/indicators";




export type EvaluationStatus =

    | "PASS"

    | "FAIL"

    | "WARNING";





export interface EvaluationRule {


    name:string;


    description:string;


    weight:number;


    evaluate:

        (

            features:IndicatorFeatureVector

        )=>boolean;


}





export interface EvaluationResult {


    status:EvaluationStatus;


    score:number;


    confidence:number;


    passed:string[];


    failed:string[];


    warnings:string[];


    timestamp:number;


}





export class StrategyEvaluator {



    evaluate(

        features:IndicatorFeatureVector,

        rules:EvaluationRule[]

    ):EvaluationResult {



        let totalWeight = 0;


        let score = 0;



        const passed:string[]=[];


        const failed:string[]=[];


        const warnings:string[]=[];





        for(

            const rule of rules

        ){


            totalWeight += rule.weight;



            const result =

                rule.evaluate(

                    features

                );




            if(result){



                score += rule.weight;



                passed.push(

                    rule.name

                );



            }

            else{



                failed.push(

                    rule.name

                );


            }


        }






        const normalizedScore =

            totalWeight === 0

            ?

            0

            :

            score /

            totalWeight;






        let status:

            EvaluationStatus;





        if(normalizedScore >=0.75){


            status="PASS";


        }

        else if(normalizedScore >=0.5){


            status="WARNING";


        }

        else{


            status="FAIL";


        }







        return {


            status,


            score:

                Number(

                    normalizedScore.toFixed(2)

                ),



            confidence:

                Number(

                    normalizedScore.toFixed(2)

                ),



            passed,


            failed,


            warnings,



            timestamp:

                Date.now()


        };


    }





    /**
     * Simple condition helper
     */
    condition(

        name:string,

        description:string,

        weight:number,

        callback:

        (

            features:IndicatorFeatureVector

        )=>boolean

    ):EvaluationRule {


        return {


            name,


            description,


            weight,


            evaluate:callback


        };


    }


}





const evaluator =

    new StrategyEvaluator();




export default evaluator;
