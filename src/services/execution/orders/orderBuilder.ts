/**
==========================================================
AURA Trade OS
Order Builder
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,

} from "../types";

import {

    MarketOrderBuilder,

} from "./marketOrder";

import {

    LimitOrderBuilder,

} from "./limitOrder";



export type BuiltOrder =

    ReturnType<MarketOrderBuilder["build"]>

    |

    ReturnType<LimitOrderBuilder["build"]>;



export class OrderBuilder {

    private readonly marketBuilder =

        new MarketOrderBuilder();



    private readonly limitBuilder =

        new LimitOrderBuilder();



    /**
     * Build order from request.
     */
    build(

        request: ExecutionRequest

    ): BuiltOrder {

        switch (

            request.orderType

        ) {

            case "MARKET":

                return this.marketBuilder.build(

                    request

                );



            case "LIMIT":

                return this.limitBuilder.build(

                    request

                );



            default:

                throw new Error(

                    `Unsupported order type: ${request.orderType}`

                );

        }

    }

}



const orderBuilder =

    new OrderBuilder();



export default orderBuilder;
