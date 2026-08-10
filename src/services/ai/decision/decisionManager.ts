/**
==========================================================
AURA Trade OS
Decision Manager
Phase 30
==========================================================
*/

import {
    DecisionEngine,
} from "./decisionEngine";

import {
    BasicDecisionModel,
} from "./decisionModel";

import {
    createDecisionInput,
    type DecisionInput,
} from "./decisionInput";

import type {
    DecisionOutput,
} from "./decisionOutput";

export class DecisionManager {
    private readonly engine:
        DecisionEngine;

    public constructor(
        engine?: DecisionEngine,
    ) {
        this.engine =
            engine ??
            new DecisionEngine(
                new BasicDecisionModel(),
            );
    }

    public decide(
        input: DecisionInput,
    ): DecisionOutput {
        return this.engine.decide(
            createDecisionInput(
                input,
            ),
        );
    }

    public getEngine():
        DecisionEngine {
        return this.engine;
    }
}

export const decisionManager =
    new DecisionManager();

export default DecisionManager;
