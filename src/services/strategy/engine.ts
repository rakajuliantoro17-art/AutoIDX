/**
==========================================================
AURA Trade OS
Strategy Service Engine
Version : 0.1.0 Alpha
==========================================================
Public Strategy Execution Facade
==========================================================
*/


import {

    IndicatorFeatureVector

}

from "@/services/indicators";



import strategyManager

from "./manager";



import strategyRegistry

from "./registry";



import type {

    StrategyMode,

    StrategyDecision

}

from "./types";







export interface StrategyEngineResult {


    strategy:string;


    mode:StrategyMode;


    decision:StrategyDecision | null;


    timestamp:number;


}









export class StrategyServiceEngine {



    private ready:boolean;




    constructor(){


        this.ready=false;


    }








    /**
     * Initialize strategy system
     */
    initialize(){



        if(this.ready)

            return;


        this.ready=true;


    }









    /**
     * Execute active strategy
     */
    execute(

        features:IndicatorFeatureVector,

        position:"NONE"|"LONG" = "NONE"

    ):StrategyEngineResult {



        this.initialize();




        const result =

            strategyManager.evaluate(

                features,

                position

            );




        return {


            strategy:

                result.strategy,



            mode:

                result.mode,



            decision:

                result.decision,



            timestamp:

                Date.now()


        };


    }









    /**
     * Change trading mode
     */
    setMode(

        mode:StrategyMode

    ){



        strategyManager.setMode(

            mode

        );


    }









    /**
     * Get available strategies
     */
    strategies(){



        return (

            strategyRegistry.active()

        );


    }









    /**
     * Compare all strategies
     */
    compare(

        features:IndicatorFeatureVector

    ){



        return (

            strategyManager.compare(

                features

            )

        );


    }




}







const strategyEngine =

    new StrategyServiceEngine();




export default strategyEngine;
