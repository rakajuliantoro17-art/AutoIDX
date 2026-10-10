/**
==========================================================
AURA Trade OS
Simulated Order
Phase 34
==========================================================
*/

export type SimulatedOrderSide =
    | "BUY"
    | "SELL";

export type SimulatedOrderType =
    | "MARKET"
    | "LIMIT";

export type SimulatedOrderStatus =
    | "CREATED"
    | "OPEN"
    | "FILLED"
    | "CANCELLED"
    | "REJECTED";

export interface SimulatedOrder {
    readonly id: string;
    readonly symbol: string;
    readonly side: SimulatedOrderSide;
    readonly type: SimulatedOrderType;
    readonly quantity: number;
    readonly requestedPrice?: number;
    readonly createdAt: number;
    readonly status: SimulatedOrderStatus;
    readonly metadata:
        Record<string, unknown>;
}

export function createSimulatedOrder(
    input: {
        readonly symbol: string;
        readonly side: SimulatedOrderSide;
        readonly type?: SimulatedOrderType;
        readonly quantity: number;
        readonly requestedPrice?: number;
        readonly createdAt: number;
        readonly metadata?: Record<string, unknown>;
    },
): SimulatedOrder {
    if (
        !Number.isFinite(input.quantity) ||
        input.quantity <= 0
    ) {
        throw new Error(
            "Simulated order quantity must be greater than zero",
        );
    }

    return {
        id: createOrderId(),
        symbol: input.symbol,
        side: input.side,
        type:
            input.type ?? "MARKET",
        quantity: input.quantity,
        requestedPrice:
            input.requestedPrice,
        createdAt:
            input.createdAt,
        status: "CREATED",
        metadata:
            input.metadata ?? {},
    };
}

function createOrderId(): string {
    return [
        "sim-order",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
