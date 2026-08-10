/**
==========================================================
AURA Trade OS
AI Evaluation Manager
Phase 32
==========================================================
*/

import {
    ModelEvaluator,
    type EvaluationPredictionProvider,
} from "./modelEvaluator";

import type {
    EvaluationDataset,
} from "./evaluationDataset";

import type {
    EvaluationResult,
} from "./evaluationResult";

export interface EvaluationRequest {
    readonly modelId: string;
    readonly modelVersion: string;
    readonly dataset: EvaluationDataset;
    readonly provider:
        EvaluationPredictionProvider;
}

export class EvaluationManager {
    private readonly evaluator =
        new ModelEvaluator();

    public evaluate(
        request: EvaluationRequest,
    ): EvaluationResult {
        return this.evaluator.evaluate(
            request.modelId,
            request.modelVersion,
            request.dataset,
            request.provider,
        );
    }

    public getEvaluator():
        ModelEvaluator {
        return this.evaluator;
    }
}

export const evaluationManager =
    new EvaluationManager();

export default EvaluationManager;
