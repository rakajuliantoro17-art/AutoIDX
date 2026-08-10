/**
==========================================================
AURA Trade OS
AI Feature Registry
Phase 31
==========================================================
*/

import type {
    Feature,
} from "./feature";

export interface FeatureDefinition {
    readonly name: string;
    readonly type: "NUMERIC" | "BOOLEAN";
    readonly description?: string;
    readonly required?: boolean;
    readonly metadata?: Record<string, unknown>;
}

export class FeatureRegistry {
    private readonly definitions =
        new Map<
            string,
            FeatureDefinition
        >();

    public register(
        definition: FeatureDefinition,
    ): void {
        this.definitions.set(
            definition.name,
            definition,
        );
    }

    public registerMany(
        definitions:
            readonly FeatureDefinition[],
    ): void {
        for (
            const definition of definitions
        ) {
            this.register(
                definition,
            );
        }
    }

    public get(
        name: string,
    ):
        | FeatureDefinition
        | undefined {
        return this.definitions.get(
            name,
        );
    }

    public has(
        name: string,
    ): boolean {
        return this.definitions.has(
            name,
        );
    }

    public list():
        readonly FeatureDefinition[] {
        return [
            ...this.definitions.values(),
        ];
    }

    public clear(): void {
        this.definitions.clear();
    }

    public validateFeature(
        feature: Feature,
    ): boolean {
        const definition =
            this.get(feature.name);

        if (!definition) {
            return false;
        }

        return (
            definition.type ===
            feature.type
        );
    }
}

export const featureRegistry =
    new FeatureRegistry();

export default FeatureRegistry;
