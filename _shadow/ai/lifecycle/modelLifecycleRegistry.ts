/**
==========================================================
AURA Trade OS
AI Model Lifecycle Registry
Phase 32
==========================================================
*/

import type {
    ModelLifecycle,
} from "./modelLifecycle";

export class ModelLifecycleRegistry {
    private readonly models =
        new Map<
            string,
            ModelLifecycle
        >();

    public register(
        model: ModelLifecycle,
    ): void {
        this.models.set(
            this.createKey(
                model.modelId,
                model.version.version,
            ),
            model,
        );
    }

    public update(
        model: ModelLifecycle,
    ): void {
        this.register(model);
    }

    public get(
        modelId: string,
        version: string,
    ):
        | ModelLifecycle
        | undefined {
        return this.models.get(
            this.createKey(
                modelId,
                version,
            ),
        );
    }

    public list(
        modelId?: string,
    ): readonly ModelLifecycle[] {
        const values = [
            ...this.models.values(),
        ];

        if (!modelId) {
            return values;
        }

        return values.filter(
            (model) =>
                model.modelId ===
                modelId,
        );
    }

    public getActive(
        modelId: string,
    ):
        | ModelLifecycle
        | undefined {
        return this.list(modelId).find(
            (model) =>
                model.status ===
                "ACTIVE",
        );
    }

    public remove(
        modelId: string,
        version: string,
    ): boolean {
        return this.models.delete(
            this.createKey(
                modelId,
                version,
            ),
        );
    }

    public clear(): void {
        this.models.clear();
    }

    private createKey(
        modelId: string,
        version: string,
    ): string {
        return `${modelId}@${version}`;
    }
}

export const modelLifecycleRegistry =
    new ModelLifecycleRegistry();

export default ModelLifecycleRegistry;
