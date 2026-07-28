/**
==========================================================
AURA Trade OS
Backtest Metrics Engine
Version : 0.1.0 Alpha
==========================================================
*/


export interface MetricTrade {


    profit:number;


    returnPercent:number;


}



export interface BacktestMetrics {


    totalTrades:number;


    winningTrades:number;


    losingTrades:number;



    winRate:number;



    averageWin:number;


    averageLoss:number;



    riskRewardRatio:number;



    expectancy:number;



    profitFactor:number;



    totalReturn:number;



    totalReturnPercent:number;



    volatility:number;



    sharpeRatio:number;



    maximumDrawdown:number;

}



export class BacktestMetricsEngine {



    calculate(

        trades:MetricTrade[],

        initialCapital:number,

        finalCapital:number,

        drawdowns:number[]

    ):BacktestMetrics {



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



        const totalTrades =

            trades.length;



        const winningTrades =

            winners.length;



        const losingTrades =

            losers.length;



        const winRate =

            totalTrades === 0

                ?

                0

                :

                (

                    winningTrades /

                    totalTrades

                )

                * 100;




        const totalWin =

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

            winningTrades === 0

                ?

                0

                :

                totalWin /

                winningTrades;




        const averageLoss =

            losingTrades === 0

                ?

                0

                :

                totalLoss /

                losingTrades;




        const riskRewardRatio =

            averageLoss === 0

                ?

                0

                :

                averageWin /

                averageLoss;




        const expectancy =


            (

                winRate / 100

            )

            *

            averageWin

            -

            (

                1 -

                (

                    winRate / 100

                )

            )

            *

            averageLoss;




        const profitFactor =

            totalLoss === 0

                ?

                totalWin

                :

                totalWin /

                totalLoss;




        const totalReturn =

            finalCapital -

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




        const returns =

            trades.map(

                trade =>

                    trade.returnPercent

            );



        const volatility =

            this.standardDeviation(

                returns

            );



        const sharpeRatio =

            volatility === 0

                ?

                0

                :

                (

                    this.average(

                        returns

                    )

                    /

                    volatility

                );



        const maximumDrawdown =

            drawdowns.length === 0

                ?

                0

                :

                Math.min(

                    ...drawdowns

                );



        return {



            totalTrades,



            winningTrades,



            losingTrades,



            winRate:

                this.round(

                    winRate

                ),



            averageWin:

                this.round(

                    averageWin

                ),



            averageLoss:

                this.round(

                    averageLoss

                ),



            riskRewardRatio:

                this.round(

                    riskRewardRatio

                ),



            expectancy:

                this.round(

                    expectancy

                ),



            profitFactor:

                this.round(

                    profitFactor

                ),



            totalReturn:

                this.round(

                    totalReturn

                ),



            totalReturnPercent:

                this.round(

                    totalReturnPercent

                ),



            volatility:

                this.round(

                    volatility

                ),



            sharpeRatio:

                this.round(

                    sharpeRatio

                ),



            maximumDrawdown:

                this.round(

                    maximumDrawdown

                )

        };

    }





    private average(

        values:number[]

    ):number {


        if(values.length===0)

            return 0;



        return values.reduce(

            (

                a,

                b

            ) => a+b,

            0

        )

        /

        values.length;

    }




    private standardDeviation(

        values:number[]

    ):number {



        if(values.length===0)

            return 0;



        const avg =

            this.average(

                values

            );



        const variance =

            this.average(

                values.map(

                    value =>

                    Math.pow(

                        value-avg,

                        2

                    )

                )

            );



        return Math.sqrt(

            variance

        );

    }




    private round(

        value:number

    ):number {


        return Number(

            value.toFixed(4)

        );

    }


}



const backtestMetrics =

    new BacktestMetricsEngine();



export default backtestMetrics;
