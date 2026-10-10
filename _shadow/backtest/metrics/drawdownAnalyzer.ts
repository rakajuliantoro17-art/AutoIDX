/**
==========================================================
AURA Trade OS
Drawdown Analyzer
Phase 34
==========================================================
*/

import type {
    PortfolioSnapshot,
} from "../portfolio/portfolioSnapshot";

export interface DrawdownPoint {
    readonly timestamp: number;
    readonly equity: number;
    readonly peak: number;
    readonly drawdown: number;
    readonly drawdownPercent: number;
}

export interface DrawdownResult {
    readonly maximumDrawdown: number;
    readonly maximumDrawdownPercent: number;
    readonly points:
        readonly DrawdownPoint[];
}

export function analyzeDrawdown(
    snapshots: readonly PortfolioSnapshot[],
): DrawdownResult {
    let peak = 0;
    let maximumDrawdown = 0;
    let maximumDrawdownPercent = 0;

    const points: DrawdownPoint[] =
        [];

    for (const snapshot of snapshots) {
        peak = Math.max(
            peak,
            snapshot.equity,
        );

        const drawdown =
            peak -
            snapshot.equity;

        const drawdownPercent =
            peak === 0
                ? 0
                : drawdown / peak;

        maximumDrawdown =
            Math.max(
                maximumDrawdown,
                drawdown,
            );

        maximumDrawdownPercent =
            Math.max(
                maximumDrawdownPercent,
                drawdownPercent,
            );

        points.push({
            timestamp:
                snapshot.timestamp,
            equity:
                snapshot.equity,
            peak,
            drawdown,
            drawdownPercent,
        });
    }

    return {
        maximumDrawdown,
        maximumDrawdownPercent,
        points,
    };
}
