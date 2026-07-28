/**
==========================================================
AURA Trade OS
Backtest Execution Simulator
Version : 0.1.0 Alpha
==========================================================
*/


export type SimulatorSide =

    | "BUY"

    | "SELL";



export type SimulatorStatus =

    | "FILLED"

    | "REJECTED";



export interface SimulatorOrder {


    id:string;


    symbol:string;


    side:SimulatorSide;


    quantity:number;


    price:number;


    timestamp:number;

}



export interface SimulatorResult {


    success:boolean;


    orderId:string;


    symbol:string;


    side:SimulatorSide;


    executedPrice:number;


    executedQuantity:number;


    status:SimulatorStatus;


    fee:number;


    timestamp:number;


}



export interface SimulatorConfig {


    initialBalance:number;


    feePercent:number;


    slippagePercent:number;

}



export class BacktestSimulator {



    private config:SimulatorConfig;



    private orders:

        SimulatorOrder[];



    constructor(

        config?:Partial<SimulatorConfig>

    ){


        this.config = {


            initialBalance:

                10000000,


            feePercent:

                0.1,


            slippagePercent:

                0.05,


            ...config

        };



        this.orders = [];

    }




    /**
     * Execute simulated order
     */
    execute(

        symbol:string,

        side:SimulatorSide,

        quantity:number,

        marketPrice:number,

        timestamp:number = Date.now()

    ):SimulatorResult {



        if(

            quantity <= 0

        ){

            return {


                success:false,


                orderId:"",


                symbol,


                side,


                executedPrice:0,


                executedQuantity:0,


                status:"REJECTED",


                fee:0,


                timestamp,

            };

        }



        const slippage =

            marketPrice *

            (

                this.config.slippagePercent /

                100

            );



        const executedPrice =

            side === "BUY"

                ?

                marketPrice + slippage

                :

                marketPrice - slippage;



        const value =

            executedPrice *

            quantity;



        const fee =

            value *

            (

                this.config.feePercent /

                100

            );



        const order:SimulatorOrder = {


            id:

                `BT-${Date.now()}`,



            symbol,



            side,



            quantity,



            price:

                executedPrice,



            timestamp,

        };



        this.orders.push(

            order

        );



        return {


            success:true,


            orderId:

                order.id,


            symbol,


            side,


            executedPrice:


                Number(

                    executedPrice.toFixed(2)

                ),



            executedQuantity:

                quantity,



            status:"FILLED",



            fee:


                Number(

                    fee.toFixed(2)

                ),



            timestamp,

        };

    }




    /**
     * Get simulated orders
     */
    getOrders():

        SimulatorOrder[] {


        return [

            ...this.orders

        ];

    }




    /**
     * Reset simulation
     */
    reset():void {


        this.orders = [];

    }



    /**
     * Get configuration
     */
    getConfig():

        SimulatorConfig {


        return {

            ...this.config

        };

    }

}



const simulator =

    new BacktestSimulator();



export default simulator;
