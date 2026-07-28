/**
==========================================================
AURA Trade OS
Backtest Fill Simulator
Version : 0.1.0 Alpha
==========================================================
Virtual Order Fill Engine
==========================================================
*/


import type {

    SimulatedOrder

}

from "./orderSimulator";






export type FillStatus =


    | "FILLED"

    | "PARTIAL"

    | "REJECTED";








export interface MarketLiquidity {


    volume:number;


    averageVolume:number;


    spread:number;


    volatility:number;


}








export interface FillResult {


    orderId:string;


    status:FillStatus;


    filledAmount:number;


    remainingAmount:number;


    executionPrice:number;


    reason:string;


    timestamp:number;


}









export interface FillSimulatorConfig {


    minimumLiquidity:number;


    maxSpread:number;


    partialFillThreshold:number;


}








export class FillSimulator {



    private config:FillSimulatorConfig;





    constructor(

        config?:Partial<FillSimulatorConfig>

    ){


        this.config={



            minimumLiquidity:

                config?.minimumLiquidity ?? 0.2,



            maxSpread:

                config?.maxSpread ?? 0.005,



            partialFillThreshold:

                config?.partialFillThreshold ?? 0.5



        };


    }









    /**
     * Simulate order execution
     */
    fill(

        order:SimulatedOrder,

        market:MarketLiquidity

    ):FillResult {



        const liquidityRatio =

            this.calculateLiquidity(

                market

            );







        /*
        ==================================
        Reject condition
        ==================================
        */


        if(

            liquidityRatio <

            this.config.minimumLiquidity

        ){


            return {


                orderId:

                    order.id,



                status:

                    "REJECTED",



                filledAmount:

                    0,



                remainingAmount:

                    order.amount,



                executionPrice:

                    0,



                reason:

                    "Insufficient liquidity",



                timestamp:

                    Date.now()


            };


        }







        /*
        ==================================
        Spread protection
        ==================================
        */


        if(

            market.spread >

            this.config.maxSpread

        ){



            return {


                orderId:

                    order.id,



                status:

                    "REJECTED",



                filledAmount:

                    0,



                remainingAmount:

                    order.amount,



                executionPrice:

                    0,



                reason:

                    "Spread too high",



                timestamp:

                    Date.now()


            };


        }








        /*
        ==================================
        Partial fill
        ==================================
        */


        if(

            liquidityRatio <

            this.config.partialFillThreshold

        ){



            const filled =

                order.amount *

                liquidityRatio;





            return {


                orderId:

                    order.id,



                status:

                    "PARTIAL",



                filledAmount:

                    Number(

                        filled.toFixed(8)

                    ),



                remainingAmount:

                    order.amount - filled,



                executionPrice:

                    order.executedPrice,



                reason:

                    "Partial liquidity available",



                timestamp:

                    Date.now()


            };



        }








        /*
        ==================================
        Full Fill
        ==================================
        */


        return {


            orderId:

                order.id,



            status:

                "FILLED",



            filledAmount:

                order.amount,



            remainingAmount:

                0,



            executionPrice:

                order.executedPrice,



            reason:

                "Order fully executed",



            timestamp:

                Date.now()


        };



    }









    private calculateLiquidity(

        market:MarketLiquidity

    ){



        if(

            market.averageVolume===0

        )

            return 0;





        return (

            market.volume /

            market.averageVolume

        );



    }



}







const fillSimulator =

    new FillSimulator();





export default fillSimulator;
