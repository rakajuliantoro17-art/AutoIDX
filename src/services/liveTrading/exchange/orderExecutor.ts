/**
==========================================================
AURA Trade OS
Indodax Order Executor
Version : 0.1.0 Alpha
==========================================================
Live Trading Order Execution Adapter
==========================================================
*/


import indodaxClient

from "./indodaxClient";

import { TRADING_CONFIG } from "@/config/trading";



import type {

    LiveOrderRequest,

    LiveExecutionResult,

    ExchangeResponse

}

from "../types";







export class OrderExecutor {




    /**
     * Execute BUY order
     */
    async buy(

        request:LiveOrderRequest

    ):Promise<LiveExecutionResult>{



        return this.execute({

            ...request,

            side:"BUY"

        });


    }









    /**
     * Execute SELL order
     */
    async sell(

        request:LiveOrderRequest

    ):Promise<LiveExecutionResult>{



        return this.execute({

            ...request,

            side:"SELL"

        });


    }









    /**
     * Main execution
     */
    private async execute(

        request:LiveOrderRequest

    ):Promise<LiveExecutionResult>{



        /**
         * PENGAMAN KESELAMATAN (jangan dihapus):
         * Order hanya benar-benar dikirim ke Indodax kalau
         * TRADING_CONFIG.mode === "live". Folder liveTrading/
         * ini sebelumnya TIDAK punya pengecekan mode sama
         * sekali -- ditambahkan supaya konsisten dengan
         * pengaman yang sama di services/exchange/adapters/indodax.ts.
         */
        if (TRADING_CONFIG.mode !== "live") {

            return {

                success: false,

                symbol: request.symbol,

                side: request.side,

                orderId: null,

                status: "REJECTED",

                executedPrice: null,

                executedQuantity: 0,

                fee: 0,

                message:

                    "[SAFETY] Order ditolak: TRADING_CONFIG.mode bukan 'live'. " +
                    "Jalur liveTrading/ ini tidak akan mengirim order asli selama " +
                    "masih mode paper.",

                timestamp: Date.now(),

            };

        }



        const params = {



            pair:

                request.symbol,



            type:

                request.side === "BUY"

                ?

                "buy"

                :

                "sell",



            price:

                request.price,



            order_type:

                request.type,



            quantity:

                request.quantity



        };








        const response =

            await indodaxClient.privateRequest(

                "trade",

                params

            );








        return this.normalize(

            response,

            request

        );


    }









    /**
     * Normalize exchange response
     */
    private normalize(

        response:ExchangeResponse,

        request:LiveOrderRequest

    ):LiveExecutionResult {



        if(

            !response.success

        ){



            return {


                success:false,

                symbol:
                    request.symbol,

                side:
                    request.side,


                orderId:null,


                status:"REJECTED",


                executedPrice:null,


                executedQuantity:0,


                fee:0,


                message:

                    response.message ?? "Order rejected by exchange.",


                timestamp:

                    Date.now()


            };


        }






        const data =

            response.data;








        return {


            success:true,

            symbol:
                request.symbol,

            side:
                request.side,


            orderId:

                data.order_id

                ??

                null,



            status:

                "FILLED",



            executedPrice:

                Number(

                    data.price

                    ??

                    0

                ),



            executedQuantity:

                Number(

                    data.filled

                    ??

                    0

                ),



            fee:

                Number(

                    data.fee

                    ??

                    0

                ),



            message:

                "Order executed",



            timestamp:

                Date.now()


        };


    }




}







const orderExecutor =

    new OrderExecutor();




export default orderExecutor;
