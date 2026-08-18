/**
==========================================================
AURA Trade OS
AURA Trend Strategy
Version : 0.1.1 Alpha
==========================================================
EMA + MACD + ADX + RSI + Stochastic Strategy
==========================================================
*/


import {

    StrategyDefinition

}

from "../core/strategyEngine";



import evaluator

from "../core/evaluator";



import {

    entryRules

}

from "../rules/entryRules";



import {

    exitRules

}

from "../rules/exitRules";



import {

    filterRules

}

from "../rules/filterRules";






export interface AuraTrendContext {


    position:

        | "NONE"

        | "LONG";


}







const auraTrend:StrategyDefinition = {



    name:

        "AURA_TREND",




    description:

        "EMA MACD ADX RSI Hybrid Trend Strategy",




    rules:[

        ...filterRules,

        ...entryRules

    ],




    execute:(features, position)=>{




        /**
         * Market Filter
         */
        const filter =

            evaluator.evaluate(

                features,

                filterRules

            );




        if(

            filter.status !== "PASS"

        ){

            return "HOLD";

        }






        /**
         * Exit Priority
         *
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

                    exitRules

                );

            if(

                exit.status === "PASS"

            ){

                return "SELL";

            }

        }






        /**
         * Entry Evaluation
         *
         * CATATAN PERBAIKAN (v0.1.1): sebelumnya BUY butuh DUA syarat
         * terpisah sekaligus -- entry.status === "PASS" (dari
         * entryRules, yang namanya muncul di reasons/log) DAN
         * strategyScore.calculate().score >= 0.70 (rumus TERPISAH,
         * bobot beda: trend/momentum/strength/volume/volatility --
         * sama sekali tidak nyambung dengan entryRules). Akibatnya
         * BUY bisa diam-diam terblokir walau SEMUA kriteria di
         * entryRules sudah lolos 100% -- log menampilkan reasons
         * yang semuanya positif ("EMA Bullish Trend, MACD Bullish
         * Confirmation, ADX Strong Trend, RSI Healthy Zone,
         * Stochastic Bullish Momentum" dst) tapi hasilnya tetap HOLD,
         * karena gerbang kedua yang tidak terlihat (dan tidak
         * tercermin di reasons) itu.
         *
         * Sekarang entry.status (weighted PASS dari entryRules yang
         * SAMA PERSIS dengan yang ditampilkan di reasons) jadi
         * SATU-SATUNYA penentu BUY -- konsisten dengan EMA_CROSSOVER
         * dan MOMENTUM yang dari awal memang cuma pakai satu gerbang
         * begini. services/strategy/scoring/strategyScore.ts TIDAK
         * dihapus (masih bisa dipakai untuk analitik/dashboard di
         * masa depan), hanya sudah tidak dipakai untuk MEMBLOKIR
         * keputusan BUY di sini lagi.
         */
        const entry =

            evaluator.evaluate(

                features,

                entryRules

            );


        if(

            entry.status === "PASS"

        ){

            return "BUY";

        }


        return "HOLD";

    }



};





export default auraTrend;
