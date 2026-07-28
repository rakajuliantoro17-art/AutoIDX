/**
==========================================================
AURA Trade OS
Mock Exchange Adapter
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



interface MockOrder {

    id:string;

    status:ExecutionStatus;

    request:ExecutionRequest;

    createdAt:number;

}



export class MockAdapter

implements ExchangeAdapter {

    readonly id = "mock";

    readonly name = "Mock Exchange";



    private readonly orders =

        new Map<string, MockOrder>();



    async execute(

        request: ExecutionRequest,

        context: ExecutionContext

    ): Promise<ExecutionResult> {

        const start = Date.now();

        const orderId =

            `MOCK-${crypto.randomUUID()}`;



        this.orders.set(

            orderId,

            {

                id: orderId,

                status: "FILLED",

                request,

                createdAt: Date.now(),

            }

        );



        return {

            success: true,

            orderId,

            status: "FILLED",

            executedPrice:

                request.price ?? null,

            executedQuantity:

                request.quantity,

            timestamp: Date.now(),

            latency:

                Date.now() - start,

            exchange:

                this.name,

            mode:

                context.mode,

            message:

                "Mock execution completed.",

        };

    }



    async cancel(

        orderId:string

    ): Promise<boolean> {

        const order =

            this.orders.get(

                orderId

            );



        if (!order) {

            return false;

        }



        order.status =

            "CANCELLED";



        return true;

    }



    async status(

        orderId:string

    ): Promise<ExecutionStatus> {

        return (

            this.orders.get(

                orderId

            )?.status ??

            "FAILED"

        );

    }



    async ping():Promise<boolean>{

        return true;

    }

}
