/**
==========================================================
AURA Trade OS
Backtest Metrics Engine
Version : 0.1.0 Alpha
==========================================================
Performance Analytics Calculator
==========================================================
*/


import type {

    BacktestTrade,

    EquityPoint,

    BacktestMetrics

}

from "./types";









export class BacktestMetricsEngine {





    /**
     * Calculate all metrics
     */
    calculate(

        trades:BacktestTrade[],

        equityCurve:EquityPoint[]

    ):BacktestMetrics {



        const totalTrades =

            trades.length;





        const winningTrades =

            trades.filter(

                trade =>

                trade.profitLoss > 0

            ).length;





        const losingTrades =

            trades.filter(

                trade =>

                trade.profitLoss < 0

            ).length;







        const totalProfit =

            trades.reduce(

                (

                    sum,

                    trade

                ) =>

                sum +

                trade.profitLoss,

                0

            );








        const winRate =

            totalTrades === 0

            ?

            0

            :

            (

                winningTrades /

                totalTrades

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



            totalProfit,



            totalReturn:

                this.calculateReturn(

                    equityCurve

                ),



            maxDrawdown:

                this.calculateDrawdown(

                    equityCurve

                ),



            profitFactor:

                this.calculateProfitFactor(

                    trades

                ),



            sharpeRatio:

                this.calculateSharpe(

                    equityCurve

                )


        };


    }









    /**
     * Total return
     */
    private calculateReturn(

        equity:EquityPoint[]

    ){



        if(equity.length < 2)

            return 0;





        const start =

            equity[0].equity;



        const end =

            equity[

                equity.length - 1

            ]

            .equity;






        return Number(

            (

                (

                    (

                    end -

                    start

                    )

                    /

                    start

                )

                *

                100

            )

            .toFixed(2)

        );


    }









    /**
     * Maximum drawdown
     */
    private calculateDrawdown(

        equity:EquityPoint[]

    ){



        let peak = 0;


        let maxDrawdown = 0;





        for(

            const point of equity

        ){



            if(

                point.equity >

                peak

            ){


                peak =

                    point.equity;


            }







            const drawdown =

                (

                    (

                    peak -

                    point.equity

                    )

                    /

                    peak

                )

                *

                100;







            if(

                drawdown >

                maxDrawdown

            ){


                maxDrawdown =

                    drawdown;


            }


        }







        return Number(

            maxDrawdown.toFixed(2)

        );


    }









    /**
     * Profit factor
     */
    private calculateProfitFactor(

        trades:BacktestTrade[]

    ){



        const profit =

            trades

            .filter(

                t =>

                t.profitLoss > 0

            )

            .reduce(

                (

                    a,

                    b

                ) =>

                a +

                b.profitLoss,

                0

            );







        const loss =

            Math.abs(

                trades

                .filter(

                    t =>

                    t.profitLoss < 0

                )

                .reduce(

                    (

                        a,

                        b

                    ) =>

                    a +

                    b.profitLoss,

                    0

                )

            );








        if(loss===0)

            return profit > 0

                ? Infinity

                : 0;





        return Number(

            (

                profit /

                loss

            )

            .toFixed(2)

        );


    }









    /**
     * Jumlah periode per tahun dari median jarak timestamp ekuitas.
     * Timestamp < 1e12 dianggap detik, selain itu milidetik.
     */
    private periodsPerYear(equity: EquityPoint[]): number {
        const gaps: number[] = [];
        for (let i = 1; i < equity.length; i++) {
            const g = equity[i].timestamp - equity[i - 1].timestamp;
            if (g > 0) gaps.push(g);
        }
        if (gaps.length === 0) return 1;
        gaps.sort((a, b) => a - b);
        const median = gaps[Math.floor(gaps.length / 2)];
        const gapSeconds = equity[equity.length - 1].timestamp < 1e12 ? median : median / 1000;
        return gapSeconds > 0 ? 31_536_000 / gapSeconds : 1;
    }

    /**
     * Simple Sharpe ratio
     */
    private calculateSharpe(

        equity:EquityPoint[]

    ){



        if(equity.length < 3)

            return 0;







        const returns:number[]=[];







        for(

            let i=1;

            i<equity.length;

            i++

        ){



            returns.push(

                (

                    equity[i].equity -

                    equity[i-1].equity

                )

                /

                equity[i-1].equity

            );


        }








        const average =

            returns.reduce(

                (

                    a,

                    b

                ) =>

                a+b,

                0

            )

            /

            returns.length;








        const variance =

            returns.reduce(

                (

                    sum,

                    value

                ) =>

                sum +

                Math.pow(

                    value -

                    average,

                    2

                ),

                0

            )

            /

            returns.length;








        const deviation =

            Math.sqrt(

                variance

            );







        if(deviation===0)

            return 0;







        // Dianualisasi (Sharpe konvensional): rasio per-periode dikali
        // akar jumlah periode per tahun. Periode diturunkan dari median
        // jarak timestamp kurva ekuitas (kripto buka 24/7); risk-free 0.
        return Number(
            (
                (average / deviation) *
                Math.sqrt(this.periodsPerYear(equity))
            ).toFixed(2)
        );


    }



}








const metricsEngine =

    new BacktestMetricsEngine();





export default metricsEngine;
