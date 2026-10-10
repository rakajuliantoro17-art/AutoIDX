/**
==========================================================
AURA Trade OS
Execution Context
Version : 0.0.7 Alpha
==========================================================
*/

import {
    createExecutionMetadata,
    ExecutionMetadata,
} from "./executionMetadata";

export interface ExecutionContext {
    readonly executionId: string;

    readonly transactionId: string;

    readonly correlationId: string;

    readonly causationId?: string;

    readonly parentExecutionId?: string;

    readonly startedAt: number;

    readonly metadata:
        ExecutionMetadata;

    readonly values:
        Record<string, unknown>;
}

export function createExecutionContext(
    options: {
        readonly executionId?: string;
        readonly transactionId: string;
        readonly correlationId?: string;
        readonly causationId?: string;
        readonly parentExecutionId?: string;
        readonly metadata?: Partial<ExecutionMetadata>;
        readonly values?: Record<string, unknown>;
    },
): ExecutionContext {
    return {
        executionId:
            options.executionId ??
            createExecutionId(),

        transactionId:
            options.transactionId,

        correlationId:
            options.correlationId ??
            createCorrelationId(),

        causationId:
            options.causationId,

        parentExecutionId:
            options.parentExecutionId,

        startedAt:
            Date.now(),

        metadata:
            createExecutionMetadata(
                options.metadata,
            ),

        values:
            options.values ?? {},
    };
}

export function createExecutionId(): string {
    return [
        "exec",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}

export function createCorrelationId(): string {
    return [
        "corr",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}
