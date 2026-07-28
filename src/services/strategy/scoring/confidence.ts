/**
==========================================================
AURA Trade OS
Strategy Confidence Engine
Version : 0.1.0 Alpha
==========================================================
Final Decision Confidence Calculation
==========================================================
*/


import {

    EvaluationResult

}

from "../core/evaluator";



import {

    StrategyScoreResult

}

from "./strategyScore";







export interface ConfidenceResult {


    confidence:number;


    level:

        | "VERY_HIGH"

        | "HIGH"

        | "MEDIUM"

        | "LOW"

        | "VERY_LOW";



    components:{


        strategyScore:number;


        ruleScore:number;


        marketScore:number;


        agreementScore:number;


    };



    explanation:string[];


    timestamp:number;


}









export class ConfidenceEngine {





    calculate(

        strategy:StrategyScoreResult,

        evaluation:EvaluationResult,

        marketScore:number = 1,

        agreementScore:number = 1

    ):ConfidenceResult {





        const strategyScore =

            strategy.score;





        const ruleScore =

            evaluation.score;







        const confidence =

            (

                strategyScore * 0.40

                +

                ruleScore * 0.30

                +

                marketScore * 0.20

                +

                agreementScore * 0.10

            );








        return {


            confidence:

                Number(

                    confidence.toFixed(2)

                ),



            level:

                this.getLevel(

                    confidence

                ),



            components:{


                strategyScore,


                ruleScore,


                marketScore,


                agreementScore


            },



            explanation:

                this.generateExplanation(

                    confidence,

                    strategyScore,

                    ruleScore

                ),



            timestamp:

                Date.now()


        };


    }







    private getLevel(

        confidence:number

    ){



        if(confidence >=0.85)

            return "VERY_HIGH";



        if(confidence >=0.70)

            return "HIGH";



        if(confidence >=0.55)

            return "MEDIUM";



        if(confidence >=0.40)

            return "LOW";



        return "VERY_LOW";


    }








    private generateExplanation(

        confidence:number,

        strategyScore:number,

        ruleScore:number

    ){



        const result:string[]=[];



        if(strategyScore>=0.70){


            result.push(

                "Strong strategy quality"

            );


        }

        else{


            result.push(

                "Weak strategy setup"

            );


        }






        if(ruleScore>=0.75){


            result.push(

                "Trading rules strongly confirmed"

            );


        }

        else{


            result.push(

                "Rules confirmation insufficient"

            );


        }






        if(confidence>=0.85){


            result.push(

                "High confidence trade opportunity"

            );


        }



        return result;


    }



}







const confidenceEngine =

    new ConfidenceEngine();





export default confidenceEngine;
