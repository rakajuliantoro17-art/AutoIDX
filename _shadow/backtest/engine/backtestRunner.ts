/**
==========================================================
AURA Trade OS
Backtest Runner
Phase 34
==========================================================
*/

import type {
    HistoricalDataset,
} from "../market/historicalDataset";

import {
    MarketReplay,
} from "../market/marketReplay";

import {
    BacktestClock,
} from "./backtestClock";

import type {
    BacktestConfig,
} from "./backtestConfig";

import {
    ExecutionSimulator,
} from "../execution/executionSimulator";

import {
    PercentageSlippageModel,
} from "../execution/slippageModel";

import {
    createSimulatedOrder,
} from "../execution/simulatedOrder";

import {
    SimulatedPortfolio,
} from "../portfolio/simulatedPortfolio";

import {
    calculatePerformanceMetrics,
} from "../metrics/performanceMetrics";

import type {
    CompletedTrade,
} from "../metrics/tradeStatistics";

import type {
    StrategyLike,
} from "./backtestContext";

import type {
    BacktestResult,
} from "./backtestResult";

export class BacktestRunner {
    public async run(
        dataset: HistoricalDataset,
        strategy: StrategyLike,
        config: BacktestConfig,
    ): Promise<BacktestResult> {
        const startedAt =
            Date.now();

        const replay =
            new MarketReplay(
                dataset.candles,
            );

        const clock =
            new BacktestClock();

        const portfolio =
            new SimulatedPortfolio(
                config.initialCapital,
            );

        const execution =
            new ExecutionSimulator({
                feeRate:
                    config.feeRate,

                slippageModel:
                    new PercentageSlippageModel(
                        config.slippageRate,
                    ),
            });

        const previousCandles = [];

        const trades:
            CompletedTrade[] = [];

        let openTrade:
            | {
                  id: string;
                  entryPrice: number;
                  quantity: number;
                  entryTime: number;
              }
            | undefined;

        try {
            while (replay.hasNext()) {
                const candle =
                    replay.next();

                if (!candle) {
                    break;
                }

                clock.set(
                    candle.timestamp,
                );

                const signal =
                    await strategy.evaluate({
                        candle,
                        previousCandles,
                        portfolio,
                    });

                if (
                    signal === "BUY" &&
                    !openTrade
                ) {
                    const quantity =
                        this.calculateQuantity(
                            portfolio,
                            candle.close,
                            config,
                        );

                    if (quantity > 0) {
                        const order =
                            createSimulatedOrder({
                                symbol:
                                    dataset.symbol,
                                side: "BUY",
                                quantity,
                                createdAt:
                                    candle.timestamp,
                            });

                        const fill =
                            execution.execute(
                                order,
                                candle,
                            );

                        portfolio.applyFill(
                            fill,
                        );

                        openTrade = {
                            id: fill.id,
                            entryPrice:
                                fill.price,
                            quantity:
                                fill.quantity,
                            entryTime:
                                fill.timestamp,
                        };
                    }
                }

                if (
                    signal === "SELL" &&
                    openTrade
                ) {
                    const order =
                        createSimulatedOrder({
                            symbol:
                                dataset.symbol,
                            side: "SELL",
                            quantity:
                                Math.min(
                                    openTrade.quantity,
                                    portfolio
                                        .getPositions()
                                        .find(
                                            (
                                                position,
                                            ) =>
                                                position.symbol ===
                                                dataset.symbol,
                                        )
                                        ?.quantity ??
                                        0,
                                ),
                            createdAt:
                                candle.timestamp,
                        });

                    if (
                        order.quantity > 0
                    ) {
                        const fill =
                            execution.execute(
                                order,
                                candle,
                            );

                        portfolio.applyFill(
                            fill,
                        );

                        trades.push({
                            id: openTrade.id,
                            symbol:
                                dataset.symbol,
                            side: "LONG",
                            entryPrice:
                                openTrade.entryPrice,
                            exitPrice:
                                fill.price,
                            quantity:
                                fill.quantity,
                            pnl:
                                (
                                    fill.price -
                                    openTrade.entryPrice
                                ) *
                                    fill.quantity -
                                fill.fee,
                            returnPercent:
                                (
                                    fill.price /
                                        openTrade.entryPrice -
                                    1
                                ),
                            entryTime:
                                openTrade.entryTime,
                            exitTime:
                                fill.timestamp,
                        });

                        openTrade =
                            undefined;
                    }
                }

                portfolio.markToMarket(
                    {
                        [dataset.symbol]:
                            candle.close,
                    },
                    candle.timestamp,
                );

                previousCandles.push(
                    candle,
                );
            }

            /*
             * Do not silently close a position
             * using future information.
             *
             * An open position at the end of
             * the test remains open.
             */

            const snapshots =
                portfolio.getSnapshots();

            const metrics =
                calculatePerformanceMetrics(
                    {
                        initialCapital:
                            config.initialCapital,
                        snapshots,
                        trades,
                        riskFreeRate:
                            config.riskFreeRate,
                        periodsPerYear:
                            config.periodsPerYear,
                    },
                );

            const completedAt =
                Date.now();

            return {
                id: createBacktestId(),
                datasetId:
                    dataset.id,
                symbol:
                    dataset.symbol,
                timeframe:
                    dataset.timeframe,
                startedAt,
                completedAt,
                durationMs:
                    completedAt -
                    startedAt,
                initialCapital:
                    config.initialCapital,
                finalEquity:
                    metrics.finalEquity,
                trades,
                snapshots,
                metrics,
                success: true,
                metadata:
                    config.metadata,
            };
        } catch (error) {
            const completedAt =
                Date.now();

            return {
                id: createBacktestId(),
                datasetId:
                    dataset.id,
                symbol:
                    dataset.symbol,
                timeframe:
                    dataset.timeframe,
                startedAt,
                completedAt,
                durationMs:
                    completedAt -
                    startedAt,
                initialCapital:
                    config.initialCapital,
                finalEquity:
                    portfolio.getCash(),
                trades,
                snapshots:
                    portfolio.getSnapshots(),
                metrics:
                    calculatePerformanceMetrics(
                        {
                            initialCapital:
                                config.initialCapital,
                            snapshots:
                                portfolio.getSnapshots(),
                            trades,
                            riskFreeRate:
                                config.riskFreeRate,
                            periodsPerYear:
                                config.periodsPerYear,
                        },
                    ),
                success: false,
                error:
                    error instanceof
                    Error
                        ? error.message
                        : String(
                              error,
                          ),
                metadata:
                    config.metadata,
            };
        }
    }

    private calculateQuantity(
        portfolio: SimulatedPortfolio,
        price: number,
        config: BacktestConfig,
    ): number {
        const maxCapital =
            config.maxPositionSize !==
            undefined
                ? portfolio.getCash() *
                  config.maxPositionSize
                : portfolio.getCash();

        if (
            maxCapital <= 0 ||
            price <= 0
        ) {
            return 0;
        }

        return (
            maxCapital / price
        );
    }
}

function createBacktestId(): string {
    return [
        "backtest",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
