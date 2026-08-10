/**
==========================================================
AURA Trade OS
Prediction Engine
Phase 30
Version : 0.0.9 Alpha
==========================================================
*/

import type {
    PredictionInput,
} from "./predictionInput";

import type {
    PredictionOutput,
} from "./predictionOutput";

import type {
    PredictionModel,
} from "./predictionModel";

export class PredictionEngine {
    public constructor(
        private readonly model: PredictionModel,
    ) {}

    public predict(
        input: PredictionInput,
    ): PredictionOutput {
        return this.model.predict(input);
    }

    public getModel(): PredictionModel {
        return this.model;
    }
}

export default PredictionEngine;
