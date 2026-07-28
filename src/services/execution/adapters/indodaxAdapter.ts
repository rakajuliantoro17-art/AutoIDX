/**
==========================================================
AURA Trade OS
Indodax Execution Adapter
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExchangeAdapter,

} from "./exchangeAdapter";

import type {

    ExecutionContext,

    ExecutionRequest,

    ExecutionResult,

    ExecutionStatus,

} from "../types";

/*
==========================================================
Exchange Layer
==========================================================
*/

import {

    ExchangeManager,

} from "@/services/exchange";



export class IndodaxAdapter

implements ExchangeAdapter {

    readonly id = "indodax";

    readonly name = "Indodax";



    constructor(

        private readonly exchange =

            new ExchangeManager()

    ) {}



    async execute(

        request: ExecutionRequest,

        context: ExecutionContext

    ): Promise<ExecutionResult> {

        const start =

            Date.now();



        try {

            /*
            ==========================================
            Translate ExecutionRequest
            into Exchange Order
            ==========================================
            */

            const response =

                await this.exchange.placeOrder({

                    symbol:

                        request.symbol,

                    side:

                        request.side.toLowerCase(),

                    type:

                        request.orderType.toLowerCase(),

                    quantity:

                        request.quantity,

                    price:

                        request.price,

                });



            return {

                success: true,

                orderId:

                    response.orderId,

                status: "PENDING",

                executedPrice:

                    null,

                executedQuantity: 0,

                timestamp:

                    Date.now(),

                latency:

                    Date.now() -

                    start,

                exchange:

                    this.name,

                mode:

                    context.mode,

                message:

                    "Order submitted.",

            };

        }

        catch (

            error

        ) {

            return {

                success: false,

                orderId: null,

                status: "FAILED",

                executedPrice: null,

                executedQuantity: 0,

                timestamp:

                    Date.now(),

                latency:

                    Date.now() -

                    start,

                exchange:

                    this.name,

                mode:

                    context.mode,

                message:

                    error instanceof Error

                        ? error.message

                        : "Execution failed.",

            };

        }

    }



    async cancel(

        orderId: string

    ): Promise<boolean> {

        return this.exchange.cancelOrder(

            orderId

        );

    }



    async status(

        orderId: string

    ): Promise<ExecutionStatus> {

        const order =

            await this.exchange.getOrder(

                orderId

            );



        switch (

            order.status

        ) {

            case "filled":

                return "FILLED";



            case "cancelled":

                return "CANCELLED";



            case "pending":

                return "PENDING";



            default:

                return "FAILED";

        }

    }



    async ping(): Promise<boolean> {

        try {

            await this.exchange.health();

            return true;

        }

        catch {

            return false;

        }

    }

}
