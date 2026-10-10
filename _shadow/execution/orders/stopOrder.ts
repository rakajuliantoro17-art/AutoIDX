/**
==========================================================
AURA Trade OS
Stop Order
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,
    OrderType,

} from "../types";



export interface StopOrder {

    symbol: string;

    side: "BUY" | "SELL";

    type: OrderType;

    quantity: number;

    stopPrice: number;

    limitPrice?: number;

    timeInForce: "GTC";

}



export class StopOrderBuilder {

    /**
     * Build stop order.
     */
    build(

        request: ExecutionRequest

    ): StopOrder {

        if (

            request.price === undefined ||

            request.price <= 0

        ) {

            throw new Error(

                "Stop order requires a valid stop price."

            );

        }



        return {

            symbol:

                request.symbol,

            side:

                request.side,

            type:

                "STOP",

            quantity:

                request.quantity,

            stopPrice:

                request.price,

            timeInForce:

                "GTC",

        };

    }

}



const stopOrder =

    new StopOrderBuilder();



export default stopOrder;
