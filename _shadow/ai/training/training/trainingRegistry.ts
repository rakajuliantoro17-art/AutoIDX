/**
==========================================================
AURA Trade OS
AI Training Registry
Phase 33
==========================================================
*/

import type {
    TrainingResult,
} from "./trainingResult";

export class TrainingRegistry {
    private readonly results =
        new Map<
            string,
            TrainingResult
        >();

    public register(
        result: TrainingResult,
    ): void {
        this.results.set(
            this.createKey(
                result.modelId,
                result.version,
            ),
            result,
        );
    }

    public get(
        modelId: string,
        version: string,
    ):
        | TrainingResult
        | undefined {
        return this.results.get(
            this.createKey(
                modelId,
                version,
            ),
        );
    }

    public list(
        modelId?: string,
    ): readonly TrainingResult[] {
        const values = [
            ...this.results.values(),
        ];

        if (!modelId) {
            return values;
        }

        return values.filter(
            (result) =>
                result.modelId ===
                modelId,
        );
    }

    public latest(
        modelId: string,
    ):
        | TrainingResult
        | undefined {
        const results =
            [...this.list(modelId)];
        return results.sort(
            (a, b) =>
                b.completedAt -
                a.completedAt,
        )[0];
    }

    public remove(
        modelId: string,
        version: string,
    ): boolean {
        return this.results.delete(
            this.createKey(
                modelId,
                version,
            ),
        );
    }

    public clear(): void {
        this.results.clear();
    }

    private createKey(
        modelId: string,
        version: string,
    ): string {
        return `${modelId}@${version}`;
    }
}

export const trainingRegistry =
    new TrainingRegistry();

export default TrainingRegistry;
