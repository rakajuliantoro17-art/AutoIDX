/**
==========================================================
AURA Trade OS
Retry Factory
Version : 0.0.8 Alpha
==========================================================
*/

import {
    normalizeRetryPolicy,
    type RetryPolicy,
} from "./retryPolicy";

import {
    createRetryContext,
    type RetryContext,
} from "./retryContext";

export interface CreateRetryOptions {
    readonly retryId?: string;
    readonly transactionId?: string;
    readonly executionId?: string;
    readonly correlationId?: string;
    readonly policy?: Partial<RetryPolicy>;
    readonly metadata?: Record<string, unknown>;
}

export class RetryFactory {
    public create(
        options: CreateRetryOptions = {},
    ): RetryContext {
        return createRetryContext({
            retryId:
                options.retryId ??
                createRetryId(),

            transactionId:
                options.transactionId,

            executionId:
                options.executionId,

            correlationId:
                options.correlationId,

            policy:
                normalizeRetryPolicy(
                    options.policy,
                ),

            metadata:
                options.metadata,
        });
    }
}

export function createRetryId(): string {
    return [
        "retry",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}

export const retryFactory =
    new RetryFactory();

export default RetryFactory;
