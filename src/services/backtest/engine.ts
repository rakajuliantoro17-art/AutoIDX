/**
==========================================================
AURA Trade OS
Backtest Engine
Version : 0.1.0 Alpha
==========================================================
Public Backtest Orchestrator
==========================================================
*/


import type {

    BacktestCandle,

    BacktestConfig,

    BacktestResult

}

from "./types";



import backtestRunner

from "./runner";



import metricsEngine

from "./metrics";



import backtestReport

from "./report";







export interface BacktestExecutionResult {


    result:BacktestResult;


    report:any;


    duration:number;


}









export class BacktestEngine {



    private history:



        BacktestExecutionResult[];






    constructor(){



        this.history=[];


    }









    /**
     * Execute backtest
     */
    run(

        candles:BacktestCandle[],

        config:BacktestConfig

    ):BacktestExecutionResult {



        this.validateConfig(

            config

        );






        const execution =

            backtestRunner.run(

                candles,

                config

            );








        const raw =

            execution.result;








        const metrics =

            metricsEngine.calculate(

                raw.trades,

                raw.equityCurve

            );









        const finalResult:BacktestResult={



            strategy:

                config.strategy,



            pair:

                config.pair,



            status:

                execution.state.status,



            initialCapital:

                config.initialCapital,



            finalCapital:

                raw.portfolio.equity,



            profitLoss:

                raw.portfolio.equity -

                config.initialCapital,



            metrics,



            trades:

                raw.trades,



            equityCurve:

                raw.equityCurve,



            createdAt:

                Date.now()



        };









        const report =

            backtestReport.generate(

                finalResult

            );








        const output = {



            result:

                finalResult,



            report,



            duration:

                execution.duration



        };









        this.history.push(

            output

        );








        return output;



    }









    /**
     * Validate configuration
     */
    private validateConfig(

        config:BacktestConfig

    ){



        if(!config.pair)

            throw new Error(

                "Pair required"

            );





        if(!config.strategy)

            throw new Error(

                "Strategy required"

            );





        if(

            config.initialCapital <= 0

        )

            throw new Error(

                "Invalid capital"

            );



    }









    /**
     * Get previous executions
     */
    getHistory(){



        return this.history;


    }









    /**
     * Last result
     */
    latest(){



        return (

            this.history[

                this.history.length-1

            ]

        );


    }



}







const backtestEngine =

    new BacktestEngine();





export default backtestEngine;
