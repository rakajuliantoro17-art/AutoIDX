/**
==========================================================
AURA Trade OS
Portfolio Performance Metrics
Version : 0.1.0 Alpha
==========================================================
*/


export interface TradeResult {


    id:string;


    symbol:string;


    profit:number;


    timestamp:number;


}



export interface PerformanceMetrics {


    totalTrades:number;


    winningTrades:number;


    losingTrades:number;



    winRate:number;


    lossRate:number;



    totalProfit:number;


    totalLoss:number;



    averageWin:number;


    averageLoss:number;



    profitFactor:number;



    expectancy:number;



    totalReturn:number;



    totalReturnPercent:number;

}



export class PerformanceMetricsCalculator {


    /**
     * Calculate trading performance.
     */
    calculate(

        trades:TradeResult[],

        initialCapital:number,

        currentCapital:number

    ):PerformanceMetrics {



        const totalTrades =

            trades.length;



        const winners =

            trades.filter(

                trade =>

                    trade.profit > 0

            );



        const losers =

            trades.filter(

                trade =>

                    trade.profit < 0

            );



        const winningTrades =

            winners.length;



        const losingTrades =

            losers.length;



        const totalProfit =

            winners.reduce(

                (

                    sum,

                    trade

                ) =>

                    sum +

                    trade.profit,

                0

            );



        const totalLoss =

            Math.abs(

                losers.reduce(

                    (

                        sum,

                        trade

                    ) =>

                        sum +

                        trade.profit,

                    0

                )

            );



        const averageWin =

            winningTrades > 0

                ?

                totalProfit /

                winningTrades

                :

                0;



        const averageLoss =

            losingTrades > 0

                ?

                totalLoss /

                losingTrades

                :

                0;



        const winRate =

            totalTrades > 0

                ?

                (

                    winningTrades /

                    totalTrades

                )

                *

                100

                :

                0;



        const lossRate =

            totalTrades > 0

                ?

                (

                    losingTrades /

                    totalTrades

                )

                *

                100

                :

                0;



        const profitFactor =

            totalLoss === 0

                ?

                totalProfit

                :

                totalProfit /

                totalLoss;



        const expectancy =

            (

                winRate / 100 *

                averageWin

            )

            -

            (

                lossRate / 100 *

                averageLoss

            );



        const totalReturn =

            currentCapital -

            initialCapital;



        const totalReturnPercent =

            initialCapital === 0

                ?

                0

                :

                (

                    totalReturn /

                    initialCapital

                )

                *

                100;



        return {


            totalTrades,


            winningTrades,


            losingTrades,



            winRate:

                Number(

                    winRate.toFixed(2)

                ),



            lossRate:

                Number(

                    lossRate.toFixed(2)

                ),



            totalProfit:

                Number(

                    totalProfit.toFixed(2)

                ),



            totalLoss:

                Number(

                    totalLoss.toFixed(2)

                ),



            averageWin:

                Number(

                    averageWin.toFixed(2)

                ),



            averageLoss:

                Number(

                    averageLoss.toFixed(2)

                ),



            profitFactor:

                Number(

                    profitFactor.toFixed(2)

                ),



            expectancy:

                Number(

                    expectancy.toFixed(2)

                ),



            totalReturn:

                Number(

                    totalReturn.toFixed(2)

                ),



            totalReturnPercent:

                Number(

                    totalReturnPercent.toFixed(2)

                ),

        };

    }

}



const performanceMetrics =

    new PerformanceMetricsCalculator();



export default performanceMetrics;
