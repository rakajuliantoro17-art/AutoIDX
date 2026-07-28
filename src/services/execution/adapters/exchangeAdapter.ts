/**
==========================================================
AURA Trade OS
Exchange Adapter
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionContext,
    ExecutionRequest,
    ExecutionResult,
    ExecutionStatus,

} from "../types";



/*
==========================================================
Exchange Adapter Contract
==========================================================
*/

export interface ExchangeAdapter {

    /**
     * Exchange identifier.
     */
    readonly id: string;

    /**
     * Exchange display name.
     */
    readonly name: string;

    /**
     * Execute an order.
     */
    execute(

        request: ExecutionRequest,

        context: ExecutionContext

    ): Promise<ExecutionResult>;

    /**
     * Cancel an existing order.
     */
    cancel(

        orderId: string

    ): Promise<boolean>;

    /**
     * Get order status.
     */
    status(

        orderId: string

    ): Promise<ExecutionStatus>;

    /**
     * Check exchange connectivity.
     */
    ping(): Promise<boolean>;

}
