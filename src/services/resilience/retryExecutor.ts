/**
==========================================================
AURA Trade OS
Retry Executor
Version : 0.0.8 Alpha
==========================================================
*/

import {
    normalizeRetryPolicy,
    type RetryPolicy,
} from "./retryPolicy";

import {
    RetryStrategy,
} from "./retryStrategy";

import {
    calculateBackoff,
    sleep,
} from "./backoff";

import {
    createRetryAttempt,
    type RetryAttempt,
} from "./retryAttempt";

import {
    createRetryFailure,
    createRetrySuccess,
    type RetryResult,
} from "./retryResult";

import {
    RetryError,
    RetryErrorCode,
} from "./retryError";

export type RetryHandler<T> =
    (
        attempt: number,
    ) =>
        T |
        Promise<T>;

export type RetryPredicate =
    (
        error: unknown,
        attempt: number,
    ) => boolean;

export interface RetryExecutorOptions {
    readonly policy?: Partial<RetryPolicy>;
    readonly strategy?:
        RetryStrategy;
    readonly shouldRetry?:
        RetryPredicate;
}

export class RetryExecutor {
    public async execute<T>(
        handler: RetryHandler<T>,
        options: RetryExecutorOptions = {},
    ): Promise<RetryResult<T>> {
        const policy =
            normalizeRetryPolicy(
                options.policy,
            );

        const strategy =
            options.strategy ??
            (
                policy.jitter
                    ? RetryStrategy.EXPONENTIAL_JITTER
                    : RetryStrategy.EXPONENTIAL
            );

        const startedAt =
            Date.now();

        const history:
            RetryAttempt[] = [];

        let lastError:
            unknown;

        for (
            let attempt = 1;
            attempt <=
            policy.maxAttempts;
            attempt++
        ) {
            const delayMs =
                attempt === 1
                    ? 0
                    : calculateBackoff(
                          attempt - 1,
                          {
                              baseDelayMs:
                                  policy.delayMs,

                              maxDelayMs:
                                  policy.maxDelayMs,

                              multiplier:
                                  policy.multiplier,

                              jitter:
                                  strategy ===
                                  RetryStrategy.EXPONENTIAL_JITTER,
                          },
                      );

            await sleep(delayMs);

            const current =
                createRetryAttempt(
                    attempt,
                    delayMs,
                );

            try {
                const value =
                    await handler(
                        attempt,
                    );

                history.push({
                    ...current,
                    completedAt:
                        Date.now(),
                    success: true,
                });

                return createRetrySuccess(
                    value,
                    history,
                    startedAt,
                );
            } catch (error) {
                lastError =
                    error;

                const retryable =
                    options.shouldRetry
                        ? options.shouldRetry(
                              error,
                              attempt,
                          )
                        : true;

                history.push({
                    ...current,
                    completedAt:
                        Date.now(),
                    success: false,
                    error,
                });

                if (!retryable) {
                    return createRetryFailure(
                        new RetryError(
                            "Error is not retryable",
                            {
                                code:
                                    RetryErrorCode.NON_RETRYABLE,
                                attempts:
                                    attempt,
                                cause:
                                    error,
                            },
                        ),
                        history,
                        startedAt,
                    );
                }
            }
        }

        return createRetryFailure(
            new RetryError(
                "Maximum retry attempts exceeded",
                {
                    code:
                        RetryErrorCode.MAX_ATTEMPTS,
                    attempts:
                        history.length,
                    cause:
                        lastError,
                },
            ),
            history,
            startedAt,
        );
    }
}

export default RetryExecutor;
