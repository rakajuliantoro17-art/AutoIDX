/**
==========================================================
AURA Trade OS
Position Calculator
Version : 0.1.0 Alpha
==========================================================
*/


import type {

    Position,

} from "./positionManager";



export interface PositionCalculation {


    symbol:string;


    quantity:number;


    averagePrice:number;


    currentPrice:number;



    costBasis:number;


    marketValue:number;



    unrealizedPnL:number;


    unrealizedPnLPercent:number;



    exposurePercent:number;

}



export class PositionCalculator {



    /**
     * Calculate single position
     */
    calculate(

        position:Position,

        currentPrice:number,

        totalPortfolioValue:number = 0

    ):PositionCalculation {



        const costBasis =

            position.quantity *

            position.averagePrice;



        const marketValue =

            position.quantity *

            currentPrice;



        const unrealizedPnL =

            marketValue -

            costBasis;



        const unrealizedPnLPercent =

            costBasis === 0

                ?

                0

                :

                (

                    unrealizedPnL /

                    costBasis

                )

                *

                100;



        const exposurePercent =

            totalPortfolioValue === 0

                ?

                0

                :

                (

                    marketValue /

                    totalPortfolioValue

                )

                *

                100;



        return {


            symbol:

                position.symbol,



            quantity:

                position.quantity,



            averagePrice:

                position.averagePrice,



            currentPrice,



            costBasis:


                Number(

                    costBasis.toFixed(2)

                ),



            marketValue:


                Number(

                    marketValue.toFixed(2)

                ),



            unrealizedPnL:


                Number(

                    unrealizedPnL.toFixed(2)

                ),



            unrealizedPnLPercent:


                Number(

                    unrealizedPnLPercent.toFixed(2)

                ),



            exposurePercent:


                Number(

                    exposurePercent.toFixed(2)

                ),

        };

    }



    /**
     * Calculate multiple positions
     */
    calculatePortfolio(

        positions:Position[],

        prices:Record<string,number>,

        totalPortfolioValue:number

    ):PositionCalculation[] {



        return positions.map(

            position =>


                this.calculate(

                    position,

                    prices[

                        position.symbol

                    ] ?? 0,

                    totalPortfolioValue

                )

        );

    }



    /**
     * Calculate total market value
     */
    totalMarketValue(

        calculations:PositionCalculation[]

    ):number {



        return calculations.reduce(

            (

                total,

                item

            ) =>


                total +

                item.marketValue,


            0

        );

    }



    /**
     * Calculate total unrealized PnL
     */
    totalUnrealizedPnL(

        calculations:PositionCalculation[]

    ):number {



        return calculations.reduce(

            (

                total,

                item

            ) =>


                total +

                item.unrealizedPnL,


            0

        );

    }

}



const positionCalculator =

    new PositionCalculator();



export default positionCalculator;
