/**
==========================================================
AURA Trade OS
AI Feature Extractor
Phase 31
==========================================================
*/

import {
    createFeature,
    type Feature,
} from "./feature";

import {
    createFeatureSet,
    type FeatureSet,
} from "./featureSet";

export interface FeatureExtractionInput {
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
    readonly metadata?: Record<
        string,
        unknown
    >;
}

export class FeatureExtractor {
    public extract(
        input: FeatureExtractionInput,
    ): FeatureSet {
        const features: Feature[] = [];

        if (
            typeof input.price === "number" &&
            Number.isFinite(input.price)
        ) {
            features.push(
                createFeature(
                    "price",
                    input.price,
                    {
                        source: "market",
                    },
                ),
            );
        }

        this.extractNumericRecord(
            features,
            input.indicators,
            "indicator",
        );

        this.extractNumericRecord(
            features,
            input.market,
            "market",
        );

        return createFeatureSet({
            symbol: input.symbol,
            timeframe:
                input.timeframe,
            features,
            metadata:
                input.metadata,
        });
    }

    private extractNumericRecord(
        target: Feature[],
        record:
            | Record<
                  string,
                  number | undefined
              >
            | undefined,
        source: string,
    ): void {
        if (!record) {
            return;
        }

        for (
            const [
                name,
                value,
            ] of Object.entries(record)
        ) {
            if (
                typeof value !== "number" ||
                !Number.isFinite(value)
            ) {
                continue;
            }

            target.push(
                createFeature(
                    name,
                    value,
                    {
                        source,
                    },
                ),
            );
        }
    }
}

export const featureExtractor =
    new FeatureExtractor();

export default FeatureExtractor;
