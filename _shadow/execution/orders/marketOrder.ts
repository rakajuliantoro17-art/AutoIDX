/**
==========================================================
AURA Trade OS
Market Order
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,
    OrderType,

} from "../types";



export interface MarketOrder {

    symbol: string;

    side: "BUY" | "SELL";

    type: OrderType;

    quantity: number;

}



export class MarketOrderBuilder {

    /**
     * Build a market order.
     */
    build(

        request: ExecutionRequest

    ): MarketOrder {

        if (

            request.quantity <= 0

        ) {

            throw new Error(

                "Market order requires a valid quantity."

            );

        }



        return {

            symbol:

                request.symbol,

            side:

                request.side,

            type:

                "MARKET",

            quantity:

                request.quantity,

        };

    }

}



const marketOrder =

    new MarketOrderBuilder();



export default marketOrder;
