/**
==========================================================
AURA Trade OS
AI Model Lifecycle Manager
Phase 32
==========================================================
*/

import type {
    ModelLifecycle,
} from "./modelLifecycle";

import type {
    ModelStatus,
} from "./modelStatus";

import {
    canTransitionModelStatus,
} from "./modelStatus";

export class ModelLifecycleManager {
    public transition(
        model: ModelLifecycle,
        nextStatus: ModelStatus,
    ): ModelLifecycle {
        if (
            !canTransitionModelStatus(
                model.status,
                nextStatus,
            )
        ) {
            throw new Error(
                `Invalid model lifecycle transition: ${model.status} -> ${nextStatus}`,
            );
        }

        const now = Date.now();

        return {
            ...model,
            status: nextStatus,
            updatedAt: now,
            activatedAt:
                nextStatus === "ACTIVE"
                    ? now
                    : model.activatedAt,
            deprecatedAt:
                nextStatus ===
                "DEPRECATED"
                    ? now
                    : model.deprecatedAt,
        };
    }

    public activate(
        model: ModelLifecycle,
    ): ModelLifecycle {
        return this.transition(
            model,
            "ACTIVE",
        );
    }

    public pause(
        model: ModelLifecycle,
    ): ModelLifecycle {
        return this.transition(
            model,
            "PAUSED",
        );
    }

    public deprecate(
        model: ModelLifecycle,
    ): ModelLifecycle {
        return this.transition(
            model,
            "DEPRECATED",
        );
    }

    public archive(
        model: ModelLifecycle,
    ): ModelLifecycle {
        return this.transition(
            model,
            "ARCHIVED",
        );
    }
}

export const modelLifecycleManager =
    new ModelLifecycleManager();

export default ModelLifecycleManager;
