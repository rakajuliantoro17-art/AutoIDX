/**
==========================================================
AURA Trade OS
Execution Engine
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    StrategyDecision,

} from "@/services/strategy";

import type {

    ExecutionAdapter,

    ExecutionContext,

    ExecutionResult,

} from "./types";



export interface ExecutionEngineOptions {

    adapter: ExecutionAdapter;

}



export class ExecutionEngine {

    private readonly adapter: ExecutionAdapter;



    constructor(

        options: ExecutionEngineOptions

    ) {

        this.adapter =

            options.adapter;

    }



    /**
     * Execute strategy decision.
     */
    async execute(

        decision: StrategyDecision,

        context: ExecutionContext

    ): Promise<ExecutionResult> {


        if (

            decision.signal === "HOLD"

        ) {

            return {

                success: true,

                executed: false,

                message:

                    "No execution required.",

            };

        }



        return this.adapter.execute(

            decision,

            context

        );

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
