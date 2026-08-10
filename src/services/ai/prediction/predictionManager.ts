/**
==========================================================
AURA Trade OS
Prediction Manager
Phase 30
==========================================================
*/

import {
    PredictionEngine,
} from "./predictionEngine";

import {
    BasicPredictionModel,
} from "./predictionModel";

import {
    createPredictionContext,
} from "./predictionContext";

import {
    createPredictionInput,
    type PredictionInput,
} from "./predictionInput";

import type {
    PredictionOutput,
} from "./predictionOutput";

export class PredictionManager {
    private readonly engine:
        PredictionEngine;

    public constructor(
        engine?: PredictionEngine,
    ) {
        this.engine =
            engine ??
            new PredictionEngine(
                new BasicPredictionModel(),
            );
    }

    public predict(
        input: PredictionInput,
    ): PredictionOutput {
        const normalized =
            createPredictionInput(
                input,
            );

        const context =
            createPredictionContext(
                normalized,
            );

        const output =
            this.engine.predict(
                context.input,
            );

        return output;
    }

    public getEngine():
        PredictionEngine {
        return this.engine;
    }
}

export const predictionManager =
    new PredictionManager();

export default PredictionManager;
