/**
==========================================================
AURA Trade OS
Execution Simulator
Phase 34
==========================================================
*/

import {
    createSimulatedFill,
    type SimulatedFill,
} from "./simulatedFill";

import {
    type SimulatedOrder,
} from "./simulatedOrder";

import type {
    HistoricalCandle,
} from "../market/historicalCandle";

import {
    PercentageSlippageModel,
    type SlippageModel,
} from "./slippageModel";

export interface ExecutionSimulatorConfig {
    readonly feeRate: number;
    readonly slippageModel?: SlippageModel;
}

export class ExecutionSimulator {
    private readonly feeRate: number;

    private readonly slippageModel:
        SlippageModel;

    constructor(
        config: ExecutionSimulatorConfig,
    ) {
        if (
            config.feeRate < 0 ||
            !Number.isFinite(
                config.feeRate,
            )
        ) {
            throw new Error(
                "Invalid fee rate",
            );
        }

        this.feeRate =
            config.feeRate;

        this.slippageModel =
            config.slippageModel ??
            new PercentageSlippageModel(
                0,
            );
    }

    public execute(
        order: SimulatedOrder,
        candle: HistoricalCandle,
    ): SimulatedFill {
        const rawPrice =
            candle.close;

        const executionPrice =
            this.slippageModel.apply(
                rawPrice,
                order.side,
            );

        return createSimulatedFill(
            order,
            executionPrice,
            this.feeRate,
            candle.timestamp,
        );
    }
}
