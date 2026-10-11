/**
==========================================================
AURA Trade OS
Optimizer Manager
Phase 30
==========================================================
*/

import {
    OptimizerEngine,
} from "./optimizerEngine";

import {
    BasicOptimizerModel,
} from "./optimizerModel";

import {
    createOptimizerInput,
    type OptimizerInput,
} from "./optimizerInput";

import type {
    OptimizerOutput,
} from "./optimizerOutput";

export class OptimizerManager {
    private readonly engine:
        OptimizerEngine;

    public constructor(
        engine?: OptimizerEngine,
    ) {
        this.engine =
            engine ??
            new OptimizerEngine(
                new BasicOptimizerModel(),
            );
    }

    public optimize(
        input: OptimizerInput,
    ): OptimizerOutput {
        return this.engine.optimize(
            createOptimizerInput(
                input,
            ),
        );
    }

    public getEngine():
        OptimizerEngine {
        return this.engine;
    }
}

export const optimizerManager =
    new OptimizerManager();

export default OptimizerManager;
