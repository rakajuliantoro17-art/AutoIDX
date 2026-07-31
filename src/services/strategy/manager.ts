/**
==========================================================
AURA Trade OS
Strategy Manager
Version : 0.1.0 Alpha
==========================================================
Strategy Orchestration Layer
==========================================================
*/


import {

    IndicatorFeatureVector

}

from "@/services/indicators";



import strategyEngine from "./core/strategyEngine";

import type {

    StrategyDecision

}

from "./types";



import auraTrend

from "./strategies/auraTrend";



import emaCrossover

from "./strategies/emaCrossover";



import momentum

from "./strategies/momentum";







export type StrategyMode =


    | "CONSERVATIVE"

    | "BALANCED"

    | "AGGRESSIVE";









export interface StrategyManagerResult {


    mode:StrategyMode;


    strategy:string;


    decision:StrategyDecision|null;


    timestamp:number;


}









export class StrategyManager {



    private initialized:boolean;


    private activeMode:StrategyMode;





    constructor(){


        this.initialized=false;


        this.activeMode="BALANCED";


    }








    /**
     * Initialize strategies
     */
    initialize(){



        if(this.initialized)

            return;





        strategyEngine.register(

            auraTrend

        );



        strategyEngine.register(

            emaCrossover

        );



        strategyEngine.register(

            momentum

        );





        this.initialized=true;



    }









    /**
     * Change strategy mode
     */
    setMode(

        mode:StrategyMode

    ){



        this.activeMode=mode;


    }









    /**
     * Get active strategy
     */
    private getStrategyName(){



        switch(

            this.activeMode

        ){



            case "CONSERVATIVE":


                return "EMA_CROSSOVER";




            case "AGGRESSIVE":


                return "MOMENTUM";




            case "BALANCED":


            default:


                return "AURA_TREND";


        }


    }









    /**
     * Execute active strategy
     */
    evaluate(

        features:IndicatorFeatureVector

    ):StrategyManagerResult {



        this.initialize();





        const strategy =

            this.getStrategyName();





        const decision =

            strategyEngine.evaluate(

                strategy,

                features

            );








        return {


            mode:

                this.activeMode,



            strategy,



            decision,



            timestamp:

                Date.now()


        };


    }









    /**
     * Evaluate all strategies
     */
    compare(

        features:IndicatorFeatureVector

    ){



        this.initialize();





        return (

            strategyEngine.evaluateAll(

                features

            )

        );


    }



}







const strategyManager =

    new StrategyManager();





export default strategyManager;
