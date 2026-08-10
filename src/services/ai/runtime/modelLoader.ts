/**
==========================================================
AURA Trade OS
AI Model Loader
Phase 31
==========================================================
*/

import type {
    ModelExecutor,
} from "./modelExecutor";

export interface ModelLoader {
    load(
        modelId: string,
        modelVersion: string,
    ): ModelExecutor;
}

export class RegistryModelLoader
    implements ModelLoader {
    private readonly loaders =
        new Map<
            string,
            () => ModelExecutor
        >();

    public register(
        modelId: string,
        factory: () => ModelExecutor,
    ): void {
        this.loaders.set(
            modelId,
            factory,
        );
    }

    public load(
        modelId: string,
        _modelVersion: string,
    ): ModelExecutor {
        const factory =
            this.loaders.get(modelId);

        if (!factory) {
            throw new Error(
                `AI model "${modelId}" is not registered`,
            );
        }

        return factory();
    }
}

export const modelLoader =
    new RegistryModelLoader();

export default RegistryModelLoader;
