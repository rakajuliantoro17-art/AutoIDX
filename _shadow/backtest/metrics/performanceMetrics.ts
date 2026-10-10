/**
==========================================================
AURA Trade OS
Performance Metrics
Phase 34
==========================================================
*/

import type {
    PortfolioSnapshot,
} from "../portfolio/portfolioSnapshot";

import {
    analyzeDrawdown,
} from "./drawdownAnalyzer";

import {
    calculateTradeStatistics,
    type CompletedTrade,
} from "./tradeStatistics";

export interface PerformanceMetrics {
    readonly initialCapital: number;
    readonly finalEquity: number;
    readonly totalReturn: number;
    readonly totalReturnPercent: number;
    readonly maxDrawdown: number;
    readonly maxDrawdownPercent: number;
    readonly sharpeRatio: number;
    readonly sortinoRatio: number;
    readonly totalTrades: number;
    readonly winningTrades: number;
    readonly losingTrades: number;
    readonly winRate: number;
    readonly profitFactor: number;
    readonly averageTrade: number;
    readonly largestWin: number;
    readonly largestLoss: number;
}

export function calculatePerformanceMetrics(
    input: {
        readonly initialCapital: number;
        readonly snapshots:
            readonly PortfolioSnapshot[];
        readonly trades:
            readonly CompletedTrade[];
        readonly riskFreeRate?: number;
        readonly periodsPerYear?: number;
    },
): PerformanceMetrics {
    const finalEquity =
        input.snapshots.length > 0
            ? input.snapshots[
                  input.snapshots.length -
                      1
              ].equity
            : input.initialCapital;

    const totalReturn =
        finalEquity -
        input.initialCapital;

    const totalReturnPercent =
        input.initialCapital === 0
            ? 0
            : totalReturn /
              input.initialCapital;

    const drawdown =
        analyzeDrawdown(
            input.snapshots,
        );

    const statistics =
        calculateTradeStatistics(
            input.trades,
        );

    const returns =
        calculateReturns(
            input.snapshots,
        );

    const periodsPerYear =
        input.periodsPerYear ??
        365;

    const riskFreeRate =
        input.riskFreeRate ?? 0;

    return {
        initialCapital:
            input.initialCapital,

        finalEquity,

        totalReturn,

        totalReturnPercent,

        maxDrawdown:
            drawdown.maximumDrawdown,

        maxDrawdownPercent:
            drawdown.maximumDrawdownPercent,

        sharpeRatio:
            calculateSharpe(
                returns,
                riskFreeRate,
                periodsPerYear,
            ),

        sortinoRatio:
            calculateSortino(
                returns,
                riskFreeRate,
                periodsPerYear,
            ),

        totalTrades:
            statistics.totalTrades,

        winningTrades:
            statistics.winningTrades,

        losingTrades:
            statistics.losingTrades,

        winRate:
            statistics.winRate,

        profitFactor:
            statistics.profitFactor,

        averageTrade:
            statistics.averageTrade,

        largestWin:
            statistics.largestWin,

        largestLoss:
            statistics.largestLoss,
    };
}

function calculateReturns(
    snapshots: readonly PortfolioSnapshot[],
): number[] {
    const returns: number[] = [];

    for (
        let i = 1;
        i < snapshots.length;
        i++
    ) {
        const previous =
            snapshots[i - 1]
                .equity;

        const current =
            snapshots[i].equity;

        if (previous === 0) {
            continue;
        }

        returns.push(
            current / previous - 1,
        );
    }

    return returns;
}

function calculateSharpe(
    returns: readonly number[],
    riskFreeRate: number,
    periodsPerYear: number,
): number {
    if (returns.length < 2) {
        return 0;
    }

    const periodicRiskFree =
        riskFreeRate /
        periodsPerYear;

    const excess =
        returns.map(
            (value) =>
                value -
                periodicRiskFree,
        );

    const mean =
        average(excess);

    const deviation =
        standardDeviation(
            excess,
        );

    if (deviation === 0) {
        return 0;
    }

    return (
        (mean / deviation) *
        Math.sqrt(
            periodsPerYear,
        )
    );
}

function calculateSortino(
    returns: readonly number[],
    riskFreeRate: number,
    periodsPerYear: number,
): number {
    if (returns.length < 2) {
        return 0;
    }

    const periodicRiskFree =
        riskFreeRate /
        periodsPerYear;

    const excess =
        returns.map(
            (value) =>
                value -
                periodicRiskFree,
        );

    const mean =
        average(excess);

    const downside =
        excess.filter(
            (value) =>
                value < 0,
        );

    if (downside.length === 0) {
        return 0;
    }

    const downsideDeviation =
        Math.sqrt(
            downside.reduce(
                (
                    sum,
                    value,
                ) =>
                    sum +
                    value * value,
                0,
            ) /
                downside.length,
        );

    if (
        downsideDeviation === 0
    ) {
        return 0;
    }

    return (
        (mean /
            downsideDeviation) *
        Math.sqrt(
            periodsPerYear,
        )
    );
}

function average(
    values: readonly number[],
): number {
    if (values.length === 0) {
        return 0;
    }

    return (
        values.reduce(
            (sum, value) =>
                sum + value,
            0,
        ) / values.length
    );
}

function standardDeviation(
    values: readonly number[],
): number {
    if (values.length < 2) {
        return 0;
    }

    const mean =
        average(values);

    const variance =
        values.reduce(
            (
                sum,
                value,
            ) =>
                sum +
                Math.pow(
                    value - mean,
                    2,
                ),
            0,
        ) /
        (values.length - 1);

    return Math.sqrt(variance);
}
