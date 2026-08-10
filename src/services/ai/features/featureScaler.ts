/**
==========================================================
AURA Trade OS
AI Feature Scaler
Phase 31
==========================================================
*/

import type {
    FeatureSet,
} from "./featureSet";

export interface FeatureScale {
    readonly min: number;
    readonly max: number;
}

export class FeatureScaler {
    public scale(
        featureSet: FeatureSet,
        targetMin = 0,
        targetMax = 1,
        scales?: Record<
            string,
            FeatureScale
        >,
    ): FeatureSet {
        const features =
            featureSet.features.map(
                (feature) => {
                    if (
                        typeof feature.value !==
                        "number"
                    ) {
                        return feature;
                    }

                    const scale =
                        scales?.[
                            feature.name
                        ];

                    if (!scale) {
                        return feature;
                    }

                    const sourceRange =
                        scale.max -
                        scale.min;

                    if (
                        sourceRange === 0
                    ) {
                        return {
                            ...feature,
                            value:
                                targetMin,
                        };
                    }

                    const ratio =
                        (feature.value -
                            scale.min) /
                        sourceRange;

                    return {
                        ...feature,
                        value:
                            targetMin +
                            ratio *
                                (
                                    targetMax -
                                    targetMin
                                ),
                    };
                },
            );

        return {
            ...featureSet,
            features,
        };
    }
}

export const featureScaler =
    new FeatureScaler();

export default FeatureScaler;
