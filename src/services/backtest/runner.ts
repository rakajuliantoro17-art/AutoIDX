/**
==========================================================
AURA Trade OS
Backtest Runner
Version : 0.1.0 Alpha
==========================================================
*/


export type RunnerStatus =

    | "IDLE"

    | "RUNNING"

    | "COMPLETED"

    | "FAILED";



export interface BacktestDataset {


    symbol:string;


    candles:BacktestCandle[];


}



export interface BacktestCandle {


    timestamp:number;


    open:number;


    high:number;


    low:number;


    close:number;


    volume:number;


}



export interface RunnerProgress {


    current:number;


    total:number;


    percentage:number;


}



export interface RunnerResult {


    success:boolean;


    status:RunnerStatus;


    processed:number;


    total:number;


    duration:number;


    message:string;


}



export interface BacktestEngineAdapter {


    process(

        candle:BacktestCandle

    ):Promise<void>;



    reset?():void;

}



export class BacktestRunner {



    private status:

        RunnerStatus;



    private progress:

        RunnerProgress;



    constructor(){


        this.status = "IDLE";


        this.progress = {


            current:0,


            total:0,


            percentage:0

        };

    }



    /**
     * Run backtest process
     */
    async run(

        dataset:BacktestDataset,

        engine:BacktestEngineAdapter

    ):Promise<RunnerResult>{



        const start =

            Date.now();



        try {



            this.status =

                "RUNNING";



            this.progress = {


                current:0,


                total:

                    dataset.candles.length,


                percentage:0

            };



            engine.reset?.();



            for(

                let i = 0;

                i < dataset.candles.length;

                i++

            ){



                const candle =

                    dataset.candles[i];



                await engine.process(

                    candle

                );



                this.progress.current =

                    i + 1;



                this.progress.percentage =

                    Number(

                        (

                            (

                                this.progress.current /

                                this.progress.total

                            )

                            *

                            100

                        )

                        .toFixed(2)

                    );

            }



            this.status =

                "COMPLETED";



            return {


                success:true,


                status:

                    this.status,


                processed:

                    this.progress.current,


                total:

                    this.progress.total,


                duration:

                    Date.now() - start,


                message:

                    "Backtest completed successfully."

            };



        }

        catch(error){



            this.status =

                "FAILED";



            return {


                success:false,


                status:

                    this.status,


                processed:

                    this.progress.current,


                total:

                    this.progress.total,


                duration:

                    Date.now() - start,


                message:

                    error instanceof Error

                        ?

                        error.message

                        :

                        "Unknown error."

            };

        }

    }




    /**
     * Current status
     */
    getStatus():

        RunnerStatus {


        return this.status;

    }




    /**
     * Current progress
     */
    getProgress():

        RunnerProgress {


        return {

            ...this.progress

        };

    }



}



const backtestRunner =

    new BacktestRunner();



export default backtestRunner;
