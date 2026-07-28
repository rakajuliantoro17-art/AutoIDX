/**
==========================================================
AURA Trade OS
Backtest Report Generator
Version : 0.1.0 Alpha
==========================================================
*/


export interface BacktestTrade {


    id:string;


    symbol:string;


    side:

        | "BUY"

        | "SELL";


    profit:number;


    timestamp:number;

}



export interface BacktestSummary {


    symbol:string;


    initialCapital:number;


    finalCapital:number;


    totalReturn:number;


    totalReturnPercent:number;



    totalTrades:number;


    winningTrades:number;


    losingTrades:number;



    winRate:number;


    profitFactor:number;



    maximumDrawdown:number;



    startTime:number;


    endTime:number;

}



export interface BacktestReport {


    generatedAt:number;


    summary:BacktestSummary;



    status:

        | "PASS"

        | "FAIL";



    notes:string[];

}



export class BacktestReportGenerator {



    generate(

        data:{

            symbol:string;

            initialCapital:number;

            finalCapital:number;

            trades:BacktestTrade[];

            maximumDrawdown:number;

            startTime:number;

            endTime:number;

        }

    ):BacktestReport {



        const trades =

            data.trades;



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



        const totalProfit =

            winners.reduce(

                (

                    total,

                    trade

                ) =>

                    total +

                    trade.profit,

                0

            );



        const totalLoss =

            Math.abs(

                losers.reduce(

                    (

                        total,

                        trade

                    ) =>

                        total +

                        trade.profit,

                    0

                )

            );



        const totalTrades =

            trades.length;



        const winRate =

            totalTrades === 0

                ?

                0

                :

                (

                    winners.length /

                    totalTrades

                )

                *

                100;



        const profitFactor =

            totalLoss === 0

                ?

                totalProfit

                :

                totalProfit /

                totalLoss;



        const totalReturn =

            data.finalCapital -

            data.initialCapital;



        const totalReturnPercent =

            data.initialCapital === 0

                ?

                0

                :

                (

                    totalReturn /

                    data.initialCapital

                )

                *

                100;



        const summary:BacktestSummary = {


            symbol:

                data.symbol,



            initialCapital:

                data.initialCapital,



            finalCapital:

                data.finalCapital,



            totalReturn:



                Number(

                    totalReturn.toFixed(2)

                ),



            totalReturnPercent:



                Number(

                    totalReturnPercent.toFixed(2)

                ),



            totalTrades,



            winningTrades:

                winners.length,



            losingTrades:

                losers.length,



            winRate:

                Number(

                    winRate.toFixed(2)

                ),



            profitFactor:

                Number(

                    profitFactor.toFixed(2)

                ),



            maximumDrawdown:

                data.maximumDrawdown,



            startTime:

                data.startTime,



            endTime:

                data.endTime,

        };



        const notes:string[] = [];



        if(

            summary.totalReturnPercent > 0

        ){

            notes.push(

                "Strategy generated positive return."

            );

        }

        else {


            notes.push(

                "Strategy generated negative return."

            );

        }



        if(

            summary.maximumDrawdown < -20

        ){

            notes.push(

                "High drawdown risk detected."

            );

        }



        if(

            summary.profitFactor >= 2

        ){

            notes.push(

                "Profit factor indicates strong edge."

            );

        }



        const status =

            (

                summary.totalReturnPercent > 0

                &&

                summary.profitFactor >= 1

            )

            ?

            "PASS"

            :

            "FAIL";



        return {


            generatedAt:

                Date.now(),



            summary,



            status,



            notes,

        };

    }

}



const backtestReport =

    new BacktestReportGenerator();



export default backtestReport;
