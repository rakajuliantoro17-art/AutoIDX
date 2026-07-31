/**
==========================================================
AURA Trade OS
Paper Trading Simulator
Version : 0.1.0 Alpha
==========================================================
*/


import type {

    PaperOrder,

    PaperExecutionResult,

    MarketTick,

    OrderType,

    TradeSide

} from "./types";



export interface SimulatorConfig {


    feePercent:number;


    slippagePercent:number;


    allowPartialFill:boolean;


}




export class PaperTradingSimulator {



    private config:SimulatorConfig;



    private executions:

        PaperExecutionResult[];




    constructor(

        config?:Partial<SimulatorConfig>

    ){


        this.config = {


            feePercent:

                0.1,


            slippagePercent:

                0.05,


            allowPartialFill:

                false,


            ...config

        };



        this.executions=[];

    }




    /**
     * Execute paper order
     */
    execute(

        order:PaperOrder,

        market:MarketTick

    ):PaperExecutionResult {



        const executionPrice =

            this.calculateExecutionPrice(

                order.side,

                order.type,

                order.price,

                market.price

            );



        if(

            executionPrice === null

        ){


            return this.record({

                success:false,

                orderId:

                    order.id,

                status:

                    "REJECTED",

                executedPrice:undefined,

                executedQuantity:0,

                fee:0,

                message:

                    "Order condition not satisfied.",

                timestamp:

                    Date.now()

            });

        }





        let quantity =

            order.quantity;



        if(

            this.config.allowPartialFill

        ){


            quantity =

                order.quantity *

                0.5;

        }





        const tradeValue =

            executionPrice *

            quantity;



        const fee =

            tradeValue *

            (

                this.config.feePercent /

                100

            );





        return this.record({

            success:true,

            orderId:

                order.id,

            status:

                "FILLED",

            executedPrice:

                Number(

                    executionPrice.toFixed(2)

                ),

            executedQuantity:

                quantity,

            fee:

                Number(

                    fee.toFixed(2)

                ),

            message:

                "Paper execution completed.",

            timestamp:

                Date.now()

        });

    }





    /**
     * Calculate simulated fill price
     */
    private calculateExecutionPrice(

        side:TradeSide,

        type:OrderType,

        orderPrice:number|undefined,

        marketPrice:number

    ):number|null {



        /**
         * Market Order
         */
        if(

            type === "MARKET"

        ){


            return this.applySlippage(

                side,

                marketPrice

            );

        }




        /**
         * Limit Order
         */
        if(

            type === "LIMIT"

        ){



            if(

                orderPrice === undefined

            ){

                return null;

            }



            if(

                side === "BUY"

                &&

                marketPrice <= orderPrice

            ){

                return orderPrice;

            }



            if(

                side === "SELL"

                &&

                marketPrice >= orderPrice

            ){

                return orderPrice;

            }



            return null;

        }



        return null;

    }





    /**
     * Apply market slippage
     */
    private applySlippage(

        side:TradeSide,

        price:number

    ):number {



        const slippage =

            price *

            (

                this.config.slippagePercent /

                100

            );



        return side === "BUY"

            ?

            price + slippage

            :

            price - slippage;

    }





    private record(

        execution:PaperExecutionResult

    ){


        this.executions.push(

            execution

        );


        return execution;

    }





    /**
     * Execution history
     */
    getExecutions():

        PaperExecutionResult[] {


        return [

            ...this.executions

        ];

    }





    /**
     * Clear history
     */
    reset(){

        this.executions=[];

    }



}




const paperSimulator =

    new PaperTradingSimulator();



export default paperSimulator;
