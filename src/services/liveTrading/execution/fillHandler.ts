/**
==========================================================
AURA Trade OS
Live Trading Fill Handler
Version : 0.1.0 Alpha
==========================================================
Order Fill Processing Layer
==========================================================
*/


import type {

    LiveExecutionResult,

    LiveTrade,

    FillEvent

}

from "../types";







export class FillHandler {



    private fills:LiveTrade[] = [];









    /**
     * Handle completed execution
     */
    handle(

        execution:LiveExecutionResult

    ):LiveTrade | null {



        if(

            !execution.success

        ){

            return null;

        }







        const trade:LiveTrade={



            id:

                this.generateId(),



            orderId:

                execution.orderId,



            symbol:

                execution.symbol,



            side:

                execution.side,



            quantity:

                execution.executedQuantity,



            price:

                execution.executedPrice,



            fee:

                execution.fee,



            timestamp:

                execution.timestamp



        };








        this.fills.push(

            trade

        );








        return trade;



    }









    /**
     * Handle partial fill
     */
    handlePartial(

        execution:LiveExecutionResult

    ){



        return {



            orderId:

                execution.orderId,



            filled:

                execution.executedQuantity,



            remaining:

                execution.remainingQuantity

                ??

                0,



            status:

                "PARTIALLY_FILLED"



        };


    }









    /**
     * Get all fills
     */
    getHistory(){



        return this.fills;


    }









    /**
     * Generate trade id
     */
    private generateId(){



        return (

            "FILL-"

            +

            Date.now()

        );


    }



}








const fillHandler =

    new FillHandler();





export default fillHandler;
