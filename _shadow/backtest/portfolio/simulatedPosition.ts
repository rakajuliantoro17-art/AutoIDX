/**
==========================================================
AURA Trade OS
Simulated Position
Phase 34
==========================================================
*/

export type PositionSide =
    | "LONG"
    | "SHORT";

export interface SimulatedPosition {
    readonly symbol: string;
    readonly side: PositionSide;
    readonly quantity: number;
    readonly averageEntryPrice: number;
    readonly openedAt: number;
    readonly realizedPnl: number;
    readonly unrealizedPnl: number;
}

export function createPosition(
    input: {
        readonly symbol: string;
        readonly side: PositionSide;
        readonly quantity: number;
        readonly entryPrice: number;
        readonly openedAt: number;
    },
): SimulatedPosition {
    if (
        input.quantity <= 0 ||
        input.entryPrice <= 0
    ) {
        throw new Error(
            "Invalid position parameters",
        );
    }

    return {
        symbol: input.symbol,
        side: input.side,
        quantity: input.quantity,
        averageEntryPrice:
            input.entryPrice,
        openedAt:
            input.openedAt,
        realizedPnl: 0,
        unrealizedPnl: 0,
    };
}

export function calculateUnrealizedPnl(
    position: SimulatedPosition,
    currentPrice: number,
): number {
    const difference =
        currentPrice -
        position.averageEntryPrice;

    const direction =
        position.side === "LONG"
            ? 1
            : -1;

    return (
        difference *
        position.quantity *
        direction
    );
}
