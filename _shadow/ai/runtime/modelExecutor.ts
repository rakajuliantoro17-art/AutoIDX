/**
==========================================================
AURA Trade OS
AI Model Executor
Phase 31
==========================================================
*/

import type {
    FeatureSet,
} from "../features/featureSet";

import type {
    ModelRuntimeConfig,
} from "./modelRuntimeConfig";

export interface ModelExecutor {
    execute(
        featureSet: FeatureSet,
        config: ModelRuntimeConfig,
    ): Record<string, unknown>;
}

export class BasicModelExecutor
    implements ModelExecutor {
    public execute(
        featureSet: FeatureSet,
        _config: ModelRuntimeConfig,
    ): Record<string, unknown> {
        const numericFeatures =
            featureSet.features.filter(
                (feature) =>
                    typeof feature.value ===
                        "number" &&
                    Number.isFinite(
                        feature.value,
                    ),
            );

        const values =
            numericFeatures.map(
                (feature) =>
                    feature.value as number,
            );

        const mean =
            values.length > 0
                ? values.reduce(
                      (
                          total,
                          value,
                      ) =>
                          total + value,
                      0,
                  ) /
                  values.length
                : 0;

        return {
            score: mean,
            featureCount:
                numericFeatures.length,
            features:
                Object.fromEntries(
                    numericFeatures.map(
                        (feature) => [
                            feature.name,
                            feature.value,
                        ],
                    ),
                ),
        };
    }
}

export default BasicModelExecutor;
