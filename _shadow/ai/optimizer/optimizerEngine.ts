/**
==========================================================
AURA Trade OS
Optimizer Engine
Phase 30
==========================================================
*/

import type {
    OptimizerInput,
} from "./optimizerInput";

import type {
    OptimizerOutput,
} from "./optimizerOutput";

import type {
    OptimizerModel,
} from "./optimizerModel";

export class OptimizerEngine {
    public constructor(
        private readonly model: OptimizerModel,
    ) {}

    public optimize(
        input: OptimizerInput,
    ): OptimizerOutput {
        return this.model.optimize(
            input,
        );
    }

    public getModel():
        OptimizerModel {
        return this.model;
    }
}

export default OptimizerEngine;
