/**
==========================================================
AURA Trade OS
Backtest Runner
Version : 0.1.0 Alpha
==========================================================
Backtest Execution Controller
==========================================================
*/


import type {

    BacktestCandle,

    BacktestConfig,

    BacktestState

}

from "./types";



import BacktestSimulator

from "./simulator";







export interface RunnerResult {


    state:BacktestState;


    result:any;


    duration:number;


}









export class BacktestRunner {



    private state:BacktestState;





    constructor(){



        this.state={


            status:"IDLE",


            currentIndex:0,


            totalCandles:0,


            progress:0,


            currentTime:0


        };


    }









    /**
     * Run full backtest
     */
    run(

        candles:BacktestCandle[],

        config:BacktestConfig

    ):RunnerResult {



        const start =

            Date.now();






        this.state={


            status:"RUNNING",


            currentIndex:0,


            totalCandles:

                candles.length,


            progress:0,


            currentTime:0



        };








        const simulator =

            new BacktestSimulator(

                config

            );









        try {



            for(

                let i=0;

                i<candles.length;

                i++

            ){



                const candle =

                    candles[i];





                simulator.processCandle(

                    candle

                );





                this.updateState(

                    i,

                    candle.timestamp,

                    candles.length

                );



            }







            this.state.status=

                "COMPLETED";







        }

        catch(error){



            this.state.status=

                "FAILED";



            throw error;



        }








        return {


            state:

                this.state,



            result:

                simulator.result(),



            duration:

                Date.now()

                -

                start



        };



    }









    /**
     * Update progress
     */
    private updateState(

        index:number,

        timestamp:number,

        total:number

    ){



        this.state.currentIndex =

            index + 1;



        this.state.currentTime =

            timestamp;



        this.state.progress =

            Number(

                (

                    (

                        index + 1

                    )

                    /

                    total

                )

                *

                100

            )

            .toFixed(2)

            as unknown as number;



    }









    /**
     * Get current status
     */
    getState(){



        return this.state;


    }



}







const backtestRunner =

    new BacktestRunner();





export default backtestRunner;
