/**
==========================================================
AURA Trade OS
AI Model Selection Manager
Phase 32
==========================================================
*/

import {
    ModelSelector,
    type ModelSelectionWeights,
} from "./modelSelector";

import type {
    EvaluationResult,
} from "../evaluation/evaluationResult";

import {
    createModelSelection,
    type ModelSelection,
} from "./modelSelection";

export class ModelSelectionManager {
    private readonly selector =
        new ModelSelector();

    public select(
        results: readonly EvaluationResult[],
        weights: ModelSelectionWeights,
    ): ModelSelection {
        const scores =
            results.map(
                (result) =>
                    this.selector.score(
                        result,
                        weights,
                    ),
            );

        const ranked =
            this.selector.rank(
                scores,
            );

        return createModelSelection(
            ranked,
            "Selected model using weighted evaluation metrics",
        );
    }

    public getSelector():
        ModelSelector {
        return this.selector;
    }
}

export const modelSelectionManager =
    new ModelSelectionManager();

export default ModelSelectionManager;
