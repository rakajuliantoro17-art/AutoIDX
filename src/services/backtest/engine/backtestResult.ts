/**
==========================================================
AURA Trade OS
Backtest Result
Phase 34
==========================================================
*/

import type {
    PortfolioSnapshot,
} from "../portfolio/portfolioSnapshot";

import type {
    CompletedTrade,
} from "../metrics/tradeStatistics";

import type {
    PerformanceMetrics,
} from "../metrics/performanceMetrics";

export interface BacktestResult {
    readonly id: string;
    readonly datasetId: string;
    readonly symbol: string;
    readonly timeframe: string;
    readonly startedAt: number;
    readonly completedAt: number;
    readonly durationMs: number;

    readonly initialCapital: number;
    readonly finalEquity: number;

    readonly trades:
        readonly CompletedTrade[];

    readonly snapshots:
        readonly PortfolioSnapshot[];

    readonly metrics:
        PerformanceMetrics;

    readonly success: boolean;
    readonly error?: string;

    readonly metadata:
        Record<string, unknown>;
}
