/**
==========================================================
AURA Trade OS
Execution Engine
Version : 0.2.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,
    ExecutionResult,
    ExecutionAdapter,
    ExecutionContext,

} from "./types";



export interface ExecutionEngineOptions {

    adapter: ExecutionAdapter;

    minimumConfidence?: number;

}



export class ExecutionEngine {

    private readonly adapter: ExecutionAdapter;

    private readonly minimumConfidence: number;



    constructor(

        options: ExecutionEngineOptions

    ) {

        this.adapter = options.adapter;

        this.minimumConfidence =

            options.minimumConfidence ?? 0.60;

    }



    /**
     * Execute trading request.
     */
    async execute(

        request: ExecutionRequest,

        context: ExecutionContext

    ): Promise<ExecutionResult> {


        /*
        ==========================================
        Basic Validation
        ==========================================
        */

        if (

            request.quantity <= 0

        ) {

            throw new Error(

                "Quantity must be greater than zero."

            );

        }



        if (

            request.confidence <

            this.minimumConfidence

        ) {

            return {

                success: false,

                orderId: null,

                status: "REJECTED",

                executedPrice: null,

                executedQuantity: 0,

                timestamp: Date.now(),

                latency: 0,

                exchange: context.exchange,

                mode: context.mode,

                message:

                    "Confidence below execution threshold.",

            };

        }



        /*
        ==========================================
        HOLD

        Nothing to execute.
        ==========================================
        */

        if (

            request.strategy?.action === "HOLD"

        ) {

            return {

                success: true,

                orderId: null,

                status: "REJECTED",

                executedPrice: null,

                executedQuantity: 0,

                timestamp: Date.now(),

                latency: 0,

                exchange: context.exchange,

                mode: context.mode,

                message:

                    "Strategy returned HOLD.",

            };

        }



        /*
        ==========================================
        Delegate execution
        to adapter.
        ==========================================
        */

        const start =

            performance.now();



        const result =

            await this.adapter.execute(

                request,

                context

            );



        const latency =

            performance.now() -

            start;



        return {

            ...result,

            latency,

        };

    }



    /**
     * Cancel order.
     */
    async cancel(

        orderId: string

    ): Promise<boolean> {

        return this.adapter.cancel(

            orderId

        );

    }



    /**
     * Get order status.
     */
    async status(

        orderId: string

    ) {

        return this.adapter.status(

            orderId

        );

    }

}
