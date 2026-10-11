/**
==========================================================
AURA Trade OS
AI Manager
Phase 30
==========================================================
*/

import {
    PredictionManager,
} from "./prediction/predictionManager";

import {
    OptimizerManager,
} from "./optimizer/optimizerManager";

import {
    DecisionManager,
} from "./decision/decisionManager";

import {
    createAIContext,
    completeAIContext,
    type AIContext,
} from "./aiContext";

import type {
    PredictionInput,
} from "./prediction/predictionInput";

import type {
    OptimizerInput,
} from "./optimizer/optimizerInput";

import type {
    DecisionInput,
} from "./decision/decisionInput";

export interface AIAnalysisRequest {
    readonly symbol: string;

    readonly timeframe?: string;

    readonly prediction:
        PredictionInput;

    readonly optimization?:
        OptimizerInput;

    readonly riskScore: number;

    readonly market?:
        Record<string, unknown>;

    readonly portfolio?:
        Record<string, unknown>;

    readonly metadata?:
        Record<string, unknown>;
}

export class AIManager {
    public readonly prediction:
        PredictionManager;

    public readonly optimizer:
        OptimizerManager;

    public readonly decision:
        DecisionManager;

    public constructor() {
        this.prediction =
            new PredictionManager();

        this.optimizer =
            new OptimizerManager();

        this.decision =
            new DecisionManager();
    }

    public analyze(
        request: AIAnalysisRequest,
    ): AIContext {
        let context =
            createAIContext({
                symbol:
                    request.symbol,

                timeframe:
                    request.timeframe,

                market:
                    request.market,

                portfolio:
                    request.portfolio,

                metadata:
                    request.metadata,
            });

        const predictionInput = {
            ...request.prediction,
            symbol:
                request.symbol,
        };

        const prediction =
            this.prediction.predict(
                predictionInput,
            );

        let optimization;

        if (
            request.optimization
        ) {
            optimization =
                this.optimizer.optimize(
                    {
                        ...request.optimization,
                        symbol:
                            request.symbol,
                    },
                );
        }

        const decisionInput:
            DecisionInput = {
            symbol:
                request.symbol,

            prediction,

            optimization,

            riskScore:
                request.riskScore,

            portfolioExposure:
                getNumericValue(
                    request.portfolio
                        ?.exposure,
                ),

            availableBalance:
                getNumericValue(
                    request.portfolio
                        ?.availableBalance,
                ),

            metadata:
                request.metadata,
        };

        const decision =
            this.decision.decide(
                decisionInput,
            );

        context =
            completeAIContext(
                context,
                {
                    prediction,
                    optimization,
                    decision,
                },
            );

        return context;
    }

    public getPredictionManager():
        PredictionManager {
        return this.prediction;
    }

    public getOptimizerManager():
        OptimizerManager {
        return this.optimizer;
    }

    public getDecisionManager():
        DecisionManager {
        return this.decision;
    }
}

function getNumericValue(
    value: unknown,
):
    number | undefined {
    return typeof value ===
        "number" &&
        Number.isFinite(value)
        ? value
        : undefined;
}

export const aiManager =
    new AIManager();

export default AIManager;
