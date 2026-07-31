/**
==========================================================
AURA Trade OS
Indodax Execution Adapter
Version : 0.1.1 Alpha
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
    exchangeManager,
} from "@/services/exchange";

import type {
    OrderStatus,
} from "@/services/exchange";

import indodaxExchangeAdapter from "@/services/exchange/adapters/indodax";

export class IndodaxAdapter
implements ExchangeAdapter {

    readonly id = "indodax";
    readonly name = "Indodax";

    constructor(
        private readonly exchange = exchangeManager
    ) {
        this.exchange.register("INDODAX", indodaxExchangeAdapter);
        this.exchange.setActive("INDODAX");
    }

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

            const now = Date.now();

            const response =
                await this.exchange
                    .getAdapter()
                    .placeOrder({
                        id: "",
                        exchange: "indodax",
                        symbol: request.symbol,
                        side: request.side,
                        type: request.orderType,
                        status: "NEW",
                        price: request.price,
                        quantity: request.quantity,
                        filledQuantity: 0,
                        remainingQuantity: request.quantity,
                        createdAt: now,
                        updatedAt: now,
                    });

            return {
                success: true,
                orderId: response.id,
                status: "PENDING",
                executedPrice: null,
                executedQuantity: 0,
                timestamp: Date.now(),
                latency: Date.now() - start,
                exchange: this.name,
                mode: context.mode,
                message: "Order submitted.",
            };

        }
        catch (error) {

            return {
                success: false,
                orderId: null,
                status: "FAILED",
                executedPrice: null,
                executedQuantity: 0,
                timestamp: Date.now(),
                latency: Date.now() - start,
                exchange: this.name,
                mode: context.mode,
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
        return this.exchange
            .getAdapter()
            .cancelOrder(orderId);
    }

    async status(
        orderId: string
    ): Promise<ExecutionStatus> {

        const order =
            await this.exchange
                .getAdapter()
                .getOrder(orderId);

        return this.mapStatus(order.status);
    }

    /**
     * Menerjemahkan OrderStatus (exchange layer)
     * ke ExecutionStatus (execution layer).
     */
    private mapStatus(
        status: OrderStatus
    ): ExecutionStatus {
        switch (status) {
            case "NEW":
            case "OPEN":
                return "PENDING";
            case "PARTIALLY_FILLED":
                return "PARTIALLY_FILLED";
            case "FILLED":
                return "FILLED";
            case "CANCELLED":
                return "CANCELLED";
            case "REJECTED":
                return "REJECTED";
            case "EXPIRED":
                return "FAILED";
            default:
                return "FAILED";
        }
    }

    async ping(): Promise<boolean> {
        try {
            await this.exchange
                .getAdapter()
                .health();
            return true;
        }
        catch {
            return false;
        }
    }

}
