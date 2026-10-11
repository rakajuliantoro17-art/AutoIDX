/**
==========================================================
AURA Trade OS
AI Model Registry
Phase 31
==========================================================
*/

import type {
    ModelExecutor,
} from "./modelExecutor";

export interface ModelRegistryEntry {
    readonly id: string;
    readonly version: string;
    readonly executor: ModelExecutor;
    readonly active: boolean;
    readonly registeredAt: number;
    readonly metadata: Record<string, unknown>;
}

export class ModelRegistry {
    private readonly models =
        new Map<
            string,
            ModelRegistryEntry
        >();

    public register(
        entry: ModelRegistryEntry,
    ): void {
        const key =
            this.createKey(
                entry.id,
                entry.version,
            );

        this.models.set(
            key,
            entry,
        );
    }

    public get(
        id: string,
        version: string,
    ):
        | ModelRegistryEntry
        | undefined {
        return this.models.get(
            this.createKey(
                id,
                version,
            ),
        );
    }

    public has(
        id: string,
        version: string,
    ): boolean {
        return this.models.has(
            this.createKey(
                id,
                version,
            ),
        );
    }

    public list():
        readonly ModelRegistryEntry[] {
        return [
            ...this.models.values(),
        ];
    }

    public remove(
        id: string,
        version: string,
    ): boolean {
        return this.models.delete(
            this.createKey(
                id,
                version,
            ),
        );
    }

    public clear(): void {
        this.models.clear();
    }

    private createKey(
        id: string,
        version: string,
    ): string {
        return `${id}@${version}`;
    }
}

export const modelRegistry =
    new ModelRegistry();

export default ModelRegistry;
