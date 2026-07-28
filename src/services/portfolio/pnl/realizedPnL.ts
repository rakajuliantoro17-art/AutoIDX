/**
==========================================================
AURA Trade OS
Realized PnL Calculator
Version : 0.1.0 Alpha
==========================================================
*/


export interface ClosedTrade {


    id:string;


    symbol:string;


    quantity:number;


    entryPrice:number;


    exitPrice:number;


    fee?:number;


    timestamp:number;


}



export interface RealizedPnLResult {


    id:string;


    symbol:string;


    quantity:number;


    entryValue:number;


    exitValue:number;


    fee:number;


    pnl:number;


    pnlPercent:number;


}



export class RealizedPnLCalculator {



    /**
     * Calculate realized profit/loss
     */
    calculate(

        trade:ClosedTrade

    ):RealizedPnLResult {



        const entryValue =

            trade.quantity *

            trade.entryPrice;



        const exitValue =

            trade.quantity *

            trade.exitPrice;



        const fee =

            trade.fee ??

            0;



        const pnl =

            (

                exitValue -

                entryValue

            )

            -

            fee;



        const pnlPercent =

            entryValue === 0

                ?

                0

                :

                (

                    pnl /

                    entryValue

                )

                *

                100;



        return {


            id:

                trade.id,



            symbol:

                trade.symbol,



            quantity:

                trade.quantity,



            entryValue:


                Number(

                    entryValue.toFixed(2)

                ),



            exitValue:


                Number(

                    exitValue.toFixed(2)

                ),



            fee:


                Number(

                    fee.toFixed(2)

                ),



            pnl:


                Number(

                    pnl.toFixed(2)

                ),



            pnlPercent:


                Number(

                    pnlPercent.toFixed(2)

                ),

        };

    }



    /**
     * Calculate multiple closed trades
     */
    calculateHistory(

        trades:ClosedTrade[]

    ) {


        return trades.map(

            trade =>

                this.calculate(

                    trade

                )

        );

    }



    /**
     * Total realized profit/loss
     */
    total(

        trades:ClosedTrade[]

    ):number {


        return this.calculateHistory(

            trades

        )

        .reduce(

            (

                total,

                trade

            ) =>

                total +

                trade.pnl,

            0

        );

    }



    /**
     * Total winning trades
     */
    wins(

        trades:ClosedTrade[]

    ):number {


        return this.calculateHistory(

            trades

        )

        .filter(

            trade =>

                trade.pnl > 0

        )

        .length;

    }



    /**
     * Total losing trades
     */
    losses(

        trades:ClosedTrade[]

    ):number {


        return this.calculateHistory(

            trades

        )

        .filter(

            trade =>

                trade.pnl < 0

        )

        .length;

    }

}



const realizedPnL =

    new RealizedPnLCalculator();



export default realizedPnL;
