/**
==========================================================
AURA Trade OS
Backtest Engine
Phase 34
==========================================================
*/

import type {
    HistoricalDataset,
} from "../market/historicalDataset";

import type {
    StrategyLike,
} from "./backtestContext";

import {
    BacktestRunner,
} from "./backtestRunner";

import {
    createBacktestConfig,
    type BacktestConfig,
} from "./backtestConfig";

import type {
    BacktestResult,
} from "./backtestResult";

export interface BacktestRequest {
    readonly dataset:
        HistoricalDataset;

    readonly strategy:
        StrategyLike;

    readonly config:
        BacktestConfig;
}

export class BacktestEngine {
    private readonly runner:
        BacktestRunner;

    constructor(
        runner?: BacktestRunner,
    ) {
        this.runner =
            runner ??
            new BacktestRunner();
    }

    public async run(
        request: BacktestRequest,
    ): Promise<BacktestResult> {
        return this.runner.run(
            request.dataset,
            request.strategy,
            request.config,
        );
    }

    public async runWithConfig(
        input: {
            readonly dataset:
                HistoricalDataset;

            readonly strategy:
                StrategyLike;

            readonly config: Parameters<
                typeof createBacktestConfig
            >[0];
        },
    ): Promise<BacktestResult> {
        const config =
            createBacktestConfig(
                input.config,
            );

        return this.run({
            dataset:
                input.dataset,
            strategy:
                input.strategy,
            config,
        });
    }
}

export const backtestEngine =
    new BacktestEngine();

export default BacktestEngine;
