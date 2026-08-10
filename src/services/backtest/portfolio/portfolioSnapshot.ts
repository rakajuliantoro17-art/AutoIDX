/**
==========================================================
AURA Trade OS
Portfolio Snapshot
Phase 34
==========================================================
*/

import type {
    SimulatedPosition,
} from "./simulatedPosition";

export interface PortfolioSnapshot {
    readonly timestamp: number;
    readonly cash: number;
    readonly equity: number;
    readonly exposure: number;
    readonly unrealizedPnl: number;
    readonly realizedPnl: number;
    readonly positions:
        readonly SimulatedPosition[];
}

export function createPortfolioSnapshot(
    input: PortfolioSnapshot,
): PortfolioSnapshot {
    return {
        timestamp: input.timestamp,
        cash: input.cash,
        equity: input.equity,
        exposure: input.exposure,
        unrealizedPnl:
            input.unrealizedPnl,
        realizedPnl:
            input.realizedPnl,
        positions: [
            ...input.positions,
        ],
    };
}
