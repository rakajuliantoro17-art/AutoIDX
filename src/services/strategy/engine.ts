/**
==========================================================
AURA Trade OS
Strategy Service Engine
Version : 0.1.0 Alpha
==========================================================
Public Strategy Execution Facade

PERINGATAN (audit orphan): file ini BUKAN yang dipakai
strategy/manager.ts - itu import "./core/strategyEngine"
(nama beda tipis, gampang salah baca). File INI cuma facade
tipis yang meneruskan ke strategyManager, tidak pernah
diimpor dari manapun (orphan total, dikonfirmasi lewat
dependency-graph scan). SENGAJA TIDAK dihapus/disambungkan -
tidak menawarkan kapabilitas baru dibanding memanggil
strategyManager langsung, cuma nambah satu layer tidak perlu.
Kalau mau pakai facade publik untuk strategy execution,
pakai strategyManager (./manager.ts) langsung.
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
