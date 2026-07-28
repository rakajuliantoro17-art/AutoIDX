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

            response

        );


    }









    /**
     * Normalize exchange response
     */
    private normalize(

        response:ExchangeResponse

    ):LiveExecutionResult {



        if(

            !response.success

        ){



            return {


                success:false,


                orderId:null,


                status:"REJECTED",


                executedPrice:null,


                executedQuantity:0,


                fee:0,


                message:

                    response.message,


                timestamp:

                    Date.now()



            };


        }







        const data =

            response.data;








        return {


            success:true,


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
