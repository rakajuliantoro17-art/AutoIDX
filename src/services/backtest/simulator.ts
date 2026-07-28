/**
==========================================================
AURA Trade OS
Backtest Simulator
Version : 0.1.0 Alpha
==========================================================
Strategy Simulation Runtime
==========================================================
*/


import type {

    BacktestCandle,

    BacktestConfig,

    BacktestTrade,

    EquityPoint

}

from "./types";



import strategyEngine

from "@/services/strategy/engine";



import orderSimulator

from "./execution/orderSimulator";



import fillSimulator

from "./execution/fillSimulator";



import VirtualPortfolio

from "./portfolio/virtualPortfolio";







export class BacktestSimulator {



    private portfolio:VirtualPortfolio;


    private trades:BacktestTrade[];


    private equityCurve:EquityPoint[];





    constructor(

        private config:BacktestConfig

    ){



        this.portfolio =

            new VirtualPortfolio({

                initialCapital:

                    config.initialCapital,

                feeRate:

                    config.feeRate

            });



        this.trades=[];


        this.equityCurve=[];


    }









    /**
     * Run one candle simulation
     */
    processCandle(

        candle:BacktestCandle

    ){



        const features:any = {



            close:

                candle.close,


            volume:

                candle.volume,


            timestamp:

                candle.timestamp


        };








        const decision =

            strategyEngine.execute(

                features

            );









        if(

            decision.decision?.action

            ===

            "BUY"

        ){



            this.executeBuy(

                candle

            );



        }







        if(

            decision.decision?.action

            ===

            "SELL"

        ){



            this.executeSell(

                candle

            );



        }








        this.portfolio.updatePrice(

            candle.close

        );





        this.recordEquity(

            candle.timestamp

        );


    }









    /**
     * Execute BUY
     */
    private executeBuy(

        candle:BacktestCandle

    ){



        const amount =

            this.calculateAmount(

                candle.close

            );





        const order =

            orderSimulator.execute({


                pair:

                    candle.pair,


                side:

                    "BUY",


                price:

                    candle.close,


                amount,


                timestamp:

                    candle.timestamp


            });








        const fill =

            fillSimulator.fill(

                order,

                {


                    volume:

                        candle.volume,


                    averageVolume:

                        candle.volume,


                    spread:

                        0.001,


                    volatility:

                        0.02


                }

            );








        if(fill.status==="FILLED"){



            this.portfolio.buy(

                candle.pair,

                fill.executionPrice,

                fill.filledAmount

            );


        }


    }









    /**
     * Execute SELL
     */
    private executeSell(

        candle:BacktestCandle

    ){



        const closed =

            this.portfolio.sell(

                candle.close

            );





        if(!closed)

            return;






        this.trades.push({



            id:

                "TRD-"+Date.now(),



            pair:

                closed.pair,



            entryPrice:

                closed.entryPrice,



            exitPrice:

                closed.exitPrice,



            quantity:

                closed.quantity,



            profitLoss:

                closed.profitLoss,



            returnPercent:

                closed.returnPercent,



            duration:

                closed.closedAt -

                closed.openedAt,



            openedAt:

                closed.openedAt,



            closedAt:

                closed.closedAt



        });


    }









    private calculateAmount(

        price:number

    ){



        return (

            this.config.initialCapital *

            0.95

        )

        /

        price;



    }









    private recordEquity(

        timestamp:number

    ){



        const snapshot =

            this.portfolio.snapshot();





        this.equityCurve.push({



            timestamp,


            equity:

                snapshot.equity,


            cash:

                snapshot.cash,


            assetValue:

                snapshot.assetValue



        });


    }









    /**
     * Final simulation result
     */
    result(){



        return {


            trades:

                this.trades,


            equityCurve:

                this.equityCurve,


            portfolio:

                this.portfolio.getBalance()



        };


    }



}







export default BacktestSimulator;
