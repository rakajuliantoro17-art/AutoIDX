/**
==========================================================
AURA Trade OS
Strategy Score Engine
Version : 0.1.0 Alpha
==========================================================
Strategy Confidence Scoring
==========================================================
*/


import {

    IndicatorFeatureVector

}

from "@/services/indicators";





export interface StrategyScoreResult {


    score:number;


    grade:

        | "A"

        | "B"

        | "C"

        | "D"

        | "F";



    components:{


        trend:number;


        momentum:number;


        strength:number;


        volume:number;


        volatility:number;


    };



    explanation:string[];


    timestamp:number;


}






export class StrategyScoreEngine {



    calculate(

        features:IndicatorFeatureVector

    ):StrategyScoreResult {



        const trend =

            this.calculateTrendScore(

                features

            );



        const momentum =

            this.calculateMomentumScore(

                features

            );



        const strength =

            this.calculateStrengthScore(

                features

            );



        const volume =

            this.calculateVolumeScore(

                features

            );



        const volatility =

            this.calculateVolatilityScore(

                features

            );







        const score =

            (

                trend * 0.30

                +

                momentum * 0.25

                +

                strength * 0.20

                +

                volume * 0.15

                +

                volatility * 0.10

            );







        return {


            score:

                Number(

                    score.toFixed(2)

                ),



            grade:

                this.getGrade(score),



            components:{


                trend,


                momentum,


                strength,


                volume,


                volatility


            },



            explanation:

                this.explanation(

                    features,

                    score

                ),



            timestamp:

                Date.now()


        };


    }







    private calculateTrendScore(

        features:IndicatorFeatureVector

    ){



        if(

            features.emaFast >

            features.emaSlow

        ){

            return 1;

        }



        if(

            features.emaFast ===

            features.emaSlow

        ){

            return 0.5;

        }



        return 0;



    }







    private calculateMomentumScore(

        features:IndicatorFeatureVector

    ){



        let score = 0;



        if(

            features.macd >

            features.macdSignal

        ){

            score +=0.5;

        }



        if(

            features.stochasticK >

            features.stochasticD

        ){

            score +=0.5;

        }



        return score;


    }







    private calculateStrengthScore(

        features:IndicatorFeatureVector

    ){



        if(

            features.adx >=35

        ){

            return 1;

        }



        if(

            features.adx >=25

        ){

            return 0.75;

        }



        if(

            features.adx >=20

        ){

            return 0.5;

        }



        return 0;



    }







    private calculateVolumeScore(

        features:IndicatorFeatureVector

    ){



        return features.volume > 0

            ?

            1

            :

            0;



    }







    private calculateVolatilityScore(

        features:IndicatorFeatureVector

    ){



        if(

            features.price <=0

        ){

            return 0;

        }





        const ratio =

            (

                features.atr /

                features.price

            );





        if(

            ratio <0.02

        ){

            return 1;

        }





        if(

            ratio <0.05

        ){

            return 0.5;

        }





        return 0;


    }








    private getGrade(

        score:number

    ){


        if(score >=0.85)

            return "A";


        if(score >=0.70)

            return "B";


        if(score >=0.55)

            return "C";


        if(score >=0.40)

            return "D";


        return "F";


    }








    private explanation(

        features:IndicatorFeatureVector,

        score:number

    ){



        const result:string[]=[];



        if(

            features.emaFast >

            features.emaSlow

        ){

            result.push(

                "Bullish EMA trend"

            );

        }



        if(

            features.macd >

            features.macdSignal

        ){

            result.push(

                "MACD momentum confirmed"

            );

        }



        if(

            features.adx >=25

        ){

            result.push(

                "Strong market trend"

            );

        }



        if(

            score >=0.70

        ){

            result.push(

                "High quality setup"

            );

        }



        return result;


    }


}







const strategyScore =

    new StrategyScoreEngine();





export default strategyScore;
