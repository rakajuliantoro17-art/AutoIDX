/**
==========================================================
AURA Trade OS
Orchestration Context
Version : 0.0.7 Alpha
==========================================================
*/

export interface OrchestrationContext {
    readonly orchestrationId: string;

    readonly correlationId?: string;

    readonly causationId?: string;

    readonly source?: string;

    readonly startedAt: number;

    readonly metadata:
        Record<string, unknown>;

    readonly data:
        Record<string, unknown>;
}


export function createOrchestrationContext(
    options: {
        readonly orchestrationId?: string;
        readonly correlationId?: string;
        readonly causationId?: string;
        readonly source?: string;
        readonly metadata?: Record<string, unknown>;
        readonly data?: Record<string, unknown>;
    } = {},
):
    OrchestrationContext {

    return {
        orchestrationId:
            options.orchestrationId ??
            createOrchestrationId(),

        correlationId:
            options.correlationId,

        causationId:
            options.causationId,

        source:
            options.source,

        startedAt:
            Date.now(),

        metadata:
            options.metadata ??
            {},

        data:
            options.data ??
            {},
    };
}


export function createOrchestrationId(): string {
    return [
        "orch",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 9),
    ].join("-");
}
