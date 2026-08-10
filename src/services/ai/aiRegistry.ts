/**
==========================================================
AURA Trade OS
AI Registry
Phase 30
==========================================================
*/

import type {
    AIContext,
} from "./aiContext";

export type AIComponentType =
    | "PREDICTION"
    | "OPTIMIZER"
    | "DECISION"
    | "MODEL";

export interface AIRegistryEntry {
    readonly id: string;

    readonly type:
        AIComponentType;

    readonly version: string;

    readonly component:
        unknown;

    readonly registeredAt: number;

    readonly metadata:
        Record<string, unknown>;
}

export class AIRegistry {
    private readonly entries =
        new Map<
            string,
            AIRegistryEntry
        >();

    private readonly contexts =
        new Map<
            string,
            AIContext
        >();

    public register(
        entry: AIRegistryEntry,
    ): void {
        this.entries.set(
            entry.id,
            entry,
        );
    }

    public get(
        id: string,
    ):
        AIRegistryEntry |
        undefined {
        return this.entries.get(
            id,
        );
    }

    public has(
        id: string,
    ): boolean {
        return this.entries.has(
            id,
        );
    }

    public remove(
        id: string,
    ): boolean {
        return this.entries.delete(
            id,
        );
    }

    public list():
        readonly AIRegistryEntry[] {
        return [
            ...this.entries.values(),
        ];
    }

    public registerContext(
        context: AIContext,
    ): void {
        this.contexts.set(
            context.requestId,
            context,
        );
    }

    public getContext(
        requestId: string,
    ):
        AIContext |
        undefined {
        return this.contexts.get(
            requestId,
        );
    }

    public removeContext(
        requestId: string,
    ): boolean {
        return this.contexts.delete(
            requestId,
        );
    }

    public listContexts():
        readonly AIContext[] {
        return [
            ...this.contexts.values(),
        ];
    }

    public clear(): void {
        this.entries.clear();
        this.contexts.clear();
    }
}

export const aiRegistry =
    new AIRegistry();

export default AIRegistry;
