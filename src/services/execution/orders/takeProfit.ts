/**
==========================================================
AURA Trade OS
Take Profit Order
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionSide,

} from "../types";



export interface TakeProfitOrder {

    symbol: string;

    side: ExecutionSide;

    quantity: number;

    targetPrice: number;

    timeInForce: "GTC";

}



export interface TakeProfitRequest {

    symbol: string;

    side: ExecutionSide;

    quantity: number;

    targetPrice: number;

}



export class TakeProfitBuilder {

    /**
     * Build take profit instruction.
     */
    build(

        request: TakeProfitRequest

    ): TakeProfitOrder {

        if (

            request.quantity <= 0

        ) {

            throw new Error(

                "Quantity must be greater than zero."

            );

        }



        if (

            request.targetPrice <= 0

        ) {

            throw new Error(

                "Target price must be greater than zero."

            );

        }



        return {

            symbol:

                request.symbol,

            side:

                request.side,

            quantity:

                request.quantity,

            targetPrice:

                request.targetPrice,

            timeInForce:

                "GTC",

        };

    }

}



const takeProfit =

    new TakeProfitBuilder();



export default takeProfit;
