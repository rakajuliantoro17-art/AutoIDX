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

import strategyRegistry from "./registry";







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
    /**
     * Mode -> nama strategi PREFERENSI (belum tentu aktif -
     * lihat getStrategyName() untuk pengecekan status).
     */
    private getPreferredStrategyName(){


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
     * Get active strategy - MENGHORMATI status enable/disable dari
     * strategyRegistry (registry.ts, di-refresh dari Firestore
     * sekali per siklus cron via refreshFromStore()). Kalau
     * strategi yang seharusnya aktif sesuai mode ternyata
     * DISABLED operator, fallback ke AURA_TREND (default aman,
     * keputusan operator - lihat docs/claude.md). Kalau AURA_TREND
     * SENDIRI juga disabled, return null - evaluate() akan
     * menghasilkan HOLD (bukan crash, bukan diam-diam pakai
     * strategi yang sudah sengaja dimatikan).
     */
    private getStrategyName(): string | null {

        const preferred = this.getPreferredStrategyName();

        const isActive = (name: string): boolean =>
            !strategyRegistry.has(name) || strategyRegistry.get(name)?.status === "ACTIVE";

        if (isActive(preferred)) {
            return preferred;
        }

        if (preferred !== "AURA_TREND" && isActive("AURA_TREND")) {
            return "AURA_TREND";
        }

        return null;

    }









    /**
     * Execute active strategy
     */
    evaluate(

        features:IndicatorFeatureVector,

        position:"NONE"|"LONG" = "NONE"

    ):StrategyManagerResult {



        this.initialize();




        const strategy =

            this.getStrategyName();




        const decision =

            strategy === null
                ? null
                : strategyEngine.evaluate(

                    strategy,

                    features,

                    position

                );




        return {


            mode:

                this.activeMode,


            strategy: strategy ?? "NONE (semua strategi disabled)",


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




        // Filter hasil evaluateAll() ke strategi yang statusnya
        // ACTIVE saja - strategi yang sengaja dinonaktifkan operator
        // (mis. karena terbukti sering salah) tidak boleh ikut
        // "memveto" sinyal strategi lain lewat sanity check
        // kontradiksi di engine.ts (checkStrategyContradiction).
        return (

            strategyEngine.evaluateAll(

                features

            ).filter((d) =>
                !strategyRegistry.has(d.strategy) ||
                strategyRegistry.get(d.strategy)?.status === "ACTIVE"
            )

        );


    }



    /**
     * Rekonsiliasi status enable/disable strategi dari Firestore -
     * dipanggil SEKALI per siklus cron (scheduler/cron.ts), sebelum
     * loop per-pair dimulai. Lihat registry.ts.refreshFromStore().
     */
    async refreshRegistry(): Promise<void> {

        await strategyRegistry.refreshFromStore();

    }


}







const strategyManager =

    new StrategyManager();




export default strategyManager;
