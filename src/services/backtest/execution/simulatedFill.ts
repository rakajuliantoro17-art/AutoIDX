/**
==========================================================
AURA Trade OS
Simulated Fill
Phase 34
==========================================================
*/

import type {
    SimulatedOrder,
} from "./simulatedOrder";

export interface SimulatedFill {
    readonly id: string;
    readonly orderId: string;
    readonly symbol: string;
    readonly side:
        SimulatedOrder["side"];
    readonly quantity: number;
    readonly price: number;
    readonly grossValue: number;
    readonly fee: number;
    readonly netValue: number;
    readonly timestamp: number;
}

export function createSimulatedFill(
    order: SimulatedOrder,
    price: number,
    feeRate: number,
    timestamp: number,
): SimulatedFill {
    if (
        !Number.isFinite(price) ||
        price <= 0
    ) {
        throw new Error(
            "Fill price must be greater than zero",
        );
    }

    if (
        !Number.isFinite(feeRate) ||
        feeRate < 0
    ) {
        throw new Error(
            "Fee rate must be non-negative",
        );
    }

    const grossValue =
        order.quantity * price;

    const fee =
        grossValue * feeRate;

    const netValue =
        order.side === "BUY"
            ? grossValue + fee
            : grossValue - fee;

    return {
        id: createFillId(),
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price,
        grossValue,
        fee,
        netValue,
        timestamp,
    };
}

function createFillId(): string {
    return [
        "sim-fill",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
