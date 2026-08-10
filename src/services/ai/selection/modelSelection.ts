/**
==========================================================
AURA Trade OS
AI Model Selection
Phase 32
==========================================================
*/

import type {
    ModelScore,
} from "./modelScore";

export interface ModelSelection {
    readonly selected:
        | ModelScore
        | undefined;

    readonly candidates:
        readonly ModelScore[];

    readonly selectedAt: number;

    readonly reason: string;

    readonly metadata:
        Record<string, unknown>;
}

export function createModelSelection(
    candidates: readonly ModelScore[],
    reason = "Highest model score",
): ModelSelection {
    const sorted = [
        ...candidates,
    ].sort(
        (a, b) =>
            b.score - a.score,
    );

    return {
        selected: sorted[0],
        candidates: sorted,
        selectedAt: Date.now(),
        reason,
        metadata: {},
    };
}
