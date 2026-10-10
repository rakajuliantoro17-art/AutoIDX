/**
==========================================================
AURA Trade OS
Unrealized PnL Calculator
Version : 0.1.0 Alpha
==========================================================
*/


export interface OpenPosition {


    id:string;


    symbol:string;


    quantity:number;


    entryPrice:number;


    currentPrice:number;


}



export interface UnrealizedPnLResult {


    symbol:string;


    quantity:number;


    entryValue:number;


    currentValue:number;


    pnl:number;


    pnlPercent:number;

}



export class UnrealizedPnLCalculator {



    /**
     * Calculate floating PnL
     */
    calculate(

        position:OpenPosition

    ):UnrealizedPnLResult {



        const entryValue =

            position.quantity *

            position.entryPrice;



        const currentValue =

            position.quantity *

            position.currentPrice;



        const pnl =

            currentValue -

            entryValue;



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


            symbol:

                position.symbol,



            quantity:

                position.quantity,



            entryValue:



                Number(

                    entryValue.toFixed(2)

                ),



            currentValue:



                Number(

                    currentValue.toFixed(2)

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
     * Calculate multiple positions
     */
    calculatePortfolio(

        positions:OpenPosition[]

    ) {


        return positions.map(

            position =>

                this.calculate(

                    position

                )

        );

    }



    /**
     * Calculate total floating PnL
     */
    total(

        positions:OpenPosition[]

    ):number {


        return this.calculatePortfolio(

            positions

        )

        .reduce(

            (

                total,

                item

            ) =>

                total +

                item.pnl,

            0

        );

    }

}



const unrealizedPnL =

    new UnrealizedPnLCalculator();



export default unrealizedPnL;
