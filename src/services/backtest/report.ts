/**
==========================================================
AURA Trade OS
Backtest Report Generator
Version : 0.1.0 Alpha
==========================================================
Backtest Result Reporting Service
==========================================================
*/


import type {

    BacktestResult,

    BacktestMetrics,

    BacktestTrade,

    EquityPoint

}

from "./types";







export interface BacktestReport {


    title:string;


    strategy:string;


    pair:string;



    summary:{


        initialCapital:number;


        finalCapital:number;


        profitLoss:number;


        returnPercent:number;


    };



    performance:BacktestMetrics;



    trading:{


        totalTrades:number;


        winningTrades:number;


        losingTrades:number;


        averageTrade:number;


    };



    risk:{


        maxDrawdown:number;


        sharpeRatio:number;


        riskLevel:string;


    };



    equityCurve:EquityPoint[];



    generatedAt:number;


}









export class BacktestReportGenerator {



    


    generate(

        result:BacktestResult

    ):BacktestReport {



        const trades =

            result.trades;





        const averageTrade =

            trades.length > 0

            ?

            result.profitLoss /

            trades.length

            :

            0;






        return {


            title:

                "AURA Trade OS Backtest Report",



            strategy:

                result.strategy,



            pair:

                result.pair,



            summary:{


                initialCapital:

                    result.initialCapital,



                finalCapital:

                    result.finalCapital,



                profitLoss:

                    result.profitLoss,



                returnPercent:

                    (

                        result.profitLoss /

                        result.initialCapital

                    )

                    *

                    100



            },



            performance:

                result.metrics,



            trading:{


                totalTrades:

                    result.metrics.totalTrades,



                winningTrades:

                    result.metrics.winningTrades,



                losingTrades:

                    result.metrics.losingTrades,



                averageTrade


            },



            risk:{


                maxDrawdown:

                    result.metrics.maxDrawdown,



                sharpeRatio:

                    result.metrics.sharpeRatio,



                riskLevel:

                    this.calculateRisk(

                        result.metrics.maxDrawdown

                    )


            },



            equityCurve:

                result.equityCurve,



            generatedAt:

                Date.now()



        };


    }









    /**
     * Determine risk category
     */
    private calculateRisk(

        drawdown:number

    ){



        if(drawdown < 5)

            return "LOW";



        if(drawdown < 15)

            return "MEDIUM";



        return "HIGH";


    }









    /**
     * Export simple text summary
     */
    summaryText(

        report:BacktestReport

    ){



        return `

AURA Trade OS BACKTEST REPORT

Strategy :

${report.strategy}


Pair :

${report.pair}


Initial Capital :

${report.summary.initialCapital}


Final Capital :

${report.summary.finalCapital}


Profit/Loss :

${report.summary.profitLoss}


Return :

${report.summary.returnPercent.toFixed(2)}%


Win Rate :

${report.performance.winRate}%


Max Drawdown :

${report.performance.maxDrawdown}%


Risk :

${report.risk.riskLevel}

        `;


    }



}







const backtestReport =

    new BacktestReportGenerator();





export default backtestReport;
