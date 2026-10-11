/**
==========================================================
AURA Trade OS
AI Context
Phase 30
==========================================================
*/

import type {
    PredictionOutput,
} from "./prediction/predictionOutput";

import type {
    OptimizerOutput,
} from "./optimizer/optimizerOutput";

import type {
    DecisionOutput,
} from "./decision/decisionOutput";

export interface AIContext {
    readonly requestId: string;

    readonly symbol: string;

    readonly timeframe?: string;

    readonly prediction?:
        PredictionOutput;

    readonly optimization?:
        OptimizerOutput;

    readonly decision?:
        DecisionOutput;

    readonly market:
        Record<string, unknown>;

    readonly risk:
        Record<string, unknown>;

    readonly portfolio:
        Record<string, unknown>;

    readonly metadata:
        Record<string, unknown>;

    readonly startedAt: number;

    readonly completedAt?: number;
}

export function createAIContext(
    options: {
        readonly symbol: string;
        readonly timeframe?: string;
        readonly market?:
            Record<string, unknown>;
        readonly risk?:
            Record<string, unknown>;
        readonly portfolio?:
            Record<string, unknown>;
        readonly metadata?:
            Record<string, unknown>;
    },
): AIContext {
    return {
        requestId:
            createAIRequestId(),

        symbol:
            options.symbol,

        timeframe:
            options.timeframe,

        market:
            options.market ?? {},

        risk:
            options.risk ?? {},

        portfolio:
            options.portfolio ?? {},

        metadata:
            options.metadata ?? {},

        startedAt:
            Date.now(),
    };
}

export function completeAIContext(
    context: AIContext,
    data: {
        readonly prediction?:
            PredictionOutput;
        readonly optimization?:
            OptimizerOutput;
        readonly decision?:
            DecisionOutput;
    },
): AIContext {
    return {
        ...context,
        ...data,
        completedAt:
            Date.now(),
    };
}

function createAIRequestId(): string {
    return [
        "ai",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}
