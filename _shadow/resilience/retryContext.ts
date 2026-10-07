/**
==========================================================
AURA Trade OS
Retry Context
Version : 0.0.8 Alpha
==========================================================
*/

import type {
    RetryPolicy,
} from "./retryPolicy";

import type {
    RetryAttempt,
} from "./retryAttempt";

export interface RetryContext {
    readonly retryId: string;
    readonly transactionId?: string;
    readonly executionId?: string;
    readonly correlationId?: string;
    readonly policy: RetryPolicy;
    readonly attempts: readonly RetryAttempt[];
    readonly startedAt: number;
    readonly metadata: Record<string, unknown>;
}

export function createRetryContext(
    options: {
        readonly retryId: string;
        readonly policy: RetryPolicy;
        readonly transactionId?: string;
        readonly executionId?: string;
        readonly correlationId?: string;
        readonly metadata?: Record<string, unknown>;
    },
): RetryContext {
    return {
        retryId:
            options.retryId,

        transactionId:
            options.transactionId,

        executionId:
            options.executionId,

        correlationId:
            options.correlationId,

        policy:
            options.policy,

        attempts: [],

        startedAt:
            Date.now(),

        metadata:
            options.metadata ?? {},
    };
}
