/**
==========================================================
AURA Trade OS
Limit Order
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,
    OrderType,

} from "../types";



export interface LimitOrder {

    symbol: string;

    side: "BUY" | "SELL";

    type: OrderType;

    quantity: number;

    price: number;

    timeInForce: "GTC";

}



export class LimitOrderBuilder {

    /**
     * Build a limit order.
     */
    build(

        request: ExecutionRequest

    ): LimitOrder {

        if (

            request.price === undefined ||

            request.price <= 0

        ) {

            throw new Error(

                "Limit order requires a valid price."

            );

        }



        return {

            symbol:

                request.symbol,

            side:

                request.side,

            type:

                "LIMIT",

            quantity:

                request.quantity,

            price:

                request.price,

            timeInForce:

                "GTC",

        };

    }

}



const limitOrder =

    new LimitOrderBuilder();



export default limitOrder;
