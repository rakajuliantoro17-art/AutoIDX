/**
==========================================================
AURA Trade OS
Backtest Context
Phase 34
==========================================================
*/

import type {
    HistoricalCandle,
} from "../market/historicalCandle";

import {
    BacktestClock,
} from "./backtestClock";

import type {
    BacktestConfig,
} from "./backtestConfig";

import {
    SimulatedPortfolio,
} from "../portfolio/simulatedPortfolio";

export type StrategySignal =
    | "BUY"
    | "SELL"
    | "HOLD";

export interface StrategyInput {
    readonly candle: HistoricalCandle;
    readonly previousCandles:
        readonly HistoricalCandle[];
    readonly portfolio:
        SimulatedPortfolio;
}

export interface StrategyLike {
    evaluate(
        input: StrategyInput,
    ): Promise<StrategySignal> |
        StrategySignal;
}

export interface BacktestContext {
    readonly clock: BacktestClock;
    readonly config: BacktestConfig;
    readonly portfolio:
        SimulatedPortfolio;
    readonly candle:
        HistoricalCandle;
    readonly previousCandles:
        readonly HistoricalCandle[];
}
