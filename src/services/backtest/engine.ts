/**
==========================================================
AURA Trade OS
Backtest Core Engine
Version : 0.1.0 Alpha
==========================================================
*/


import simulator, {

    BacktestSimulator

} from "./simulator";


import backtestMetrics

from "./metrics";


import backtestReport

from "./report";



export type BacktestSignal =

    | "BUY"

    | "SELL"

    | "HOLD";



export interface BacktestCandle {


    timestamp:number;


    open:number;


    high:number;


    low:number;


    close:number;


    volume:number;

}



export interface StrategyOutput {


    signal:BacktestSignal;


    confidence:number;

}



export interface StrategyAdapter {


    analyze(

        candle:BacktestCandle

    ):Promise<StrategyOutput>;

}



export interface EngineConfig {


    symbol:string;


    initialCapital:number;


    quantity:number;

}



export interface EngineResult {


    trades:any[];


    metrics:any;


    report:any;

}



export class BacktestEngine {



    private config:EngineConfig;



    private simulator:BacktestSimulator;



    private trades:any[];



    constructor(

        config:EngineConfig

    ){


        this.config = config;



        this.simulator =

            simulator;



        this.trades = [];

    }




    /**
     * Process single candle
     */
    async process(

        candle:BacktestCandle,

        strategy:StrategyAdapter

    ):Promise<void>{



        const decision =

            await strategy.analyze(

                candle

            );



        if(

            decision.signal === "HOLD"

        ){

            return;

        }




        const execution =

            this.simulator.execute(

                this.config.symbol,

                decision.signal,

                this.config.quantity,

                candle.close,

                candle.timestamp

            );



        if(

            execution.success

        ){



            this.trades.push({

                id:

                    execution.orderId,


                symbol:

                    execution.symbol,


                side:

                    execution.side,


                profit:0,


                returnPercent:0,


                price:

                    execution.executedPrice,


                quantity:

                    execution.executedQuantity,


                timestamp:

                    execution.timestamp

            });

        }

    }




    /**
     * Run full backtest
     */
    async run(

        candles:BacktestCandle[],

        strategy:StrategyAdapter

    ):Promise<EngineResult>{



        this.reset();



        for(

            const candle of candles

        ){


            await this.process(

                candle,

                strategy

            );

        }



        const finalCapital =

            this.calculateCapital();



        const metrics =

            backtestMetrics.calculate(

                this.trades,

                this.config.initialCapital,

                finalCapital,

                []

            );



        const report =

            backtestReport.generate({

                symbol:

                    this.config.symbol,


                initialCapital:

                    this.config.initialCapital,


                finalCapital,


                trades:

                    this.trades,


                maximumDrawdown:

                    metrics.maximumDrawdown,


                startTime:

                    candles[0]?.timestamp ?? Date.now(),


                endTime:

                    candles[candles.length-1]?.timestamp ?? Date.now()

            });



        return {


            trades:

                this.trades,


            metrics,


            report

        };

    }




    /**
     * Calculate virtual capital
     */
    private calculateCapital():

        number {



        let capital =

            this.config.initialCapital;



        for(

            const trade of this.trades

        ){



            if(

                trade.side === "SELL"

            ){

                capital +=

                    trade.profit;

            }

        }



        return capital;

    }




    /**
     * Reset engine
     */
    reset(){

        this.trades = [];

        this.simulator.reset();

    }



}



export default BacktestEngine;
