/**
==========================================================
AURA Trade OS
AI Training Result
Phase 33
==========================================================
*/

export interface TrainingMetricSet {
    readonly loss?: number;
    readonly accuracy?: number;
    readonly precision?: number;
    readonly recall?: number;
    readonly f1?: number;
    readonly mae?: number;
    readonly mse?: number;
    readonly rmse?: number;
    readonly metadata:
        Record<string, unknown>;
}

export interface TrainingArtifact {
    readonly id: string;
    readonly modelId: string;
    readonly version: string;
    readonly type: string;
    readonly uri?: string;
    readonly checksum?: string;
    readonly metadata:
        Record<string, unknown>;
}

export interface TrainingResult {
    readonly jobId: string;
    readonly modelId: string;
    readonly version: string;
    readonly datasetId: string;
    readonly trainingMetrics:
        TrainingMetricSet;
    readonly validationMetrics:
        TrainingMetricSet;
    readonly testMetrics:
        TrainingMetricSet;
    readonly featureImportance:
        Record<string, number>;
    readonly artifact?: TrainingArtifact;
    readonly durationMs: number;
    readonly completedAt: number;
    readonly success: boolean;
    readonly error?: string;
    readonly metadata:
        Record<string, unknown>;
}
