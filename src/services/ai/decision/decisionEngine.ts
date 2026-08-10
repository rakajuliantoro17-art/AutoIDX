/**
==========================================================
AURA Trade OS
Decision Engine
Phase 30
==========================================================
*/

import type {
    DecisionInput,
} from "./decisionInput";

import type {
    DecisionOutput,
} from "./decisionOutput";

import type {
    DecisionModel,
} from "./decisionModel";

export class DecisionEngine {
    public constructor(
        private readonly model: DecisionModel,
    ) {}

    public decide(
        input: DecisionInput,
    ): DecisionOutput {
        return this.model.decide(
            input,
        );
    }

    public getModel():
        DecisionModel {
        return this.model;
    }
}

export default DecisionEngine;
