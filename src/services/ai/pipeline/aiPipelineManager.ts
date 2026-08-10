/**
==========================================================
AURA Trade OS
AI Pipeline Manager
Phase 31
==========================================================
*/

import {
    FeatureExtractor,
    type FeatureExtractionInput,
} from "../features/featureExtractor";

import {
    FeatureNormalizer,
} from "../features/featureNormalizer";

import {
    FeatureValidator,
} from "../features/featureValidator";

import {
    ModelRuntime,
} from "../runtime/modelRuntime";

import {
    BasicModelExecutor,
} from "../runtime/modelExecutor";

import {
    createModelRuntimeConfig,
    type ModelRuntimeConfig,
} from "../runtime/modelRuntimeConfig";

import {
    createAIContext,
    type AIContext,
} from "../aiContext";

import {
    createAIPipelineContext,
} from "./aiPipelineContext";

import type {
    AIPipelineResult,
} from "./aiPipelineResult";

export interface AIPipelineRequest {
    readonly symbol: string;

    readonly timeframe?: string;

    readonly price?: number;

    readonly indicators?: Record<
        string,
        number | undefined
    >;

    readonly market?: Record<
        string,
        number | undefined
    >;

    readonly model:
        ModelRuntimeConfig;

    readonly requiredFeatures?:
        readonly string[];

    readonly metadata?:
        Record<string, unknown>;
}

export class AIPipelineManager {
    private readonly extractor =
        new FeatureExtractor();

    private readonly normalizer =
        new FeatureNormalizer();

    private readonly validator =
        new FeatureValidator();

    private readonly runtime =
        new ModelRuntime(
            new BasicModelExecutor(),
        );

    public execute(
        request: AIPipelineRequest,
    ): AIPipelineResult {
        const startedAt =
            Date.now();

        const aiContext =
            createAIContext({
                symbol:
                    request.symbol,
                timeframe:
                    request.timeframe,
                market:
                    request.market,
                metadata:
                    request.metadata,
            });

        createAIPipelineContext(
            aiContext,
        );

        const extractionInput:
            FeatureExtractionInput = {
            symbol:
                request.symbol,
            timeframe:
                request.timeframe,
            price:
                request.price,
            indicators:
                request.indicators,
            market:
                request.market,
            metadata:
                request.metadata,
        };

        let featureSet =
            this.extractor.extract(
                extractionInput,
            );

        const validation =
            this.validator.validate(
                featureSet,
                request.requiredFeatures ??
                    request.model
                        .requiredFeatures ??
                    [],
            );

        if (!validation.valid) {
            return {
                success: false,
                context: aiContext,
                featureSet,
                runtimeResult: {
                    success: false,
                    modelId:
                        request.model
                            .modelId,
                    modelVersion:
                        request.model
                            .modelVersion,
                    durationMs:
                        Date.now() -
                        startedAt,
                    executedAt:
                        Date.now(),
                    error:
                        validation.issues
                            .map(
                                (
                                    issue,
                                ) =>
                                    issue.message,
                            )
                            .join("; "),
                    metadata: {},
                },
                startedAt,
                completedAt:
                    Date.now(),
                error:
                    "Feature validation failed",
                metadata: {},
            };
        }

        featureSet =
            this.normalizer.normalize(
                featureSet,
                "NONE",
            );

        const config =
            createModelRuntimeConfig(
                request.model,
            );

        const runtimeResult =
            this.runtime.execute(
                featureSet,
                config,
            );

        return {
            success:
                runtimeResult.success,
            context: aiContext,
            featureSet,
            runtimeResult,
            startedAt,
            completedAt:
                Date.now(),
            error:
                runtimeResult.error,
            metadata: {},
        };
    }

    public getRuntime():
        ModelRuntime {
        return this.runtime;
    }
}

export const aiPipelineManager =
    new AIPipelineManager();

export default AIPipelineManager;
