/**
==========================================================
AURA Trade OS
Transaction Context
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    ExecutionContext,
} from "./executionContext";

import type {
    TransactionMetadata,
} from "./transactionMetadata";

export interface TransactionContext {
    readonly transactionId: string;

    readonly correlationId: string;

    readonly causationId?: string;

    readonly execution?: ExecutionContext;

    readonly createdAt: number;

    readonly metadata:
        TransactionMetadata;

    readonly values:
        Record<string, unknown>;
}

export function createTransactionContext(
    options: {
        readonly transactionId: string;
        readonly correlationId?: string;
        readonly causationId?: string;
        readonly execution?: ExecutionContext;
        readonly metadata: TransactionMetadata;
        readonly values?: Record<string, unknown>;
    },
): TransactionContext {
    return {
        transactionId:
            options.transactionId,

        correlationId:
            options.correlationId ??
            options.execution?.correlationId ??
            createContextCorrelationId(),

        causationId:
            options.causationId,

        execution:
            options.execution,

        createdAt:
            Date.now(),

        metadata:
            options.metadata,

        values:
            options.values ?? {},
    };
}

function createContextCorrelationId(): string {
    return [
        "corr",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
