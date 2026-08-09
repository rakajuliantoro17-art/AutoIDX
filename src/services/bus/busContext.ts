/**
==========================================================
AURA Trade OS
Bus Context
Version : 0.0.7 Alpha
==========================================================
*/

export interface BusContext {
    readonly dispatchId: string;

    readonly correlationId?: string;

    readonly causationId?: string;

    readonly source?: string;

    readonly startedAt: number;

    readonly metadata:
        Record<string, unknown>;

    readonly data:
        Record<string, unknown>;
}

export function createBusContext(
    options: {
        readonly dispatchId?: string;
        readonly correlationId?: string;
        readonly causationId?: string;
        readonly source?: string;
        readonly metadata?: Record<string, unknown>;
        readonly data?: Record<string, unknown>;
    } = {},
): BusContext {
    return {
        dispatchId:
            options.dispatchId ??
            createDispatchId(),

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

export function createDispatchId(): string {
    return [
        "dispatch",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 9),
    ].join("-");
}
