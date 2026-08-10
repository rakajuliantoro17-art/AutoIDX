/**
==========================================================
AURA Trade OS
Resilience Manager
Version : 0.0.8 Alpha
==========================================================
*/

import {
    RetryManager,
} from "./retryManager";

import {
    RetryStrategy,
} from "./retryStrategy";

import type {
    RetryPolicy,
} from "./retryPolicy";

import type {
    RetryResult,
} from "./retryResult";

import {
    CircuitBreaker,
} from "./circuitBreaker";

import type {
    CircuitBreakerConfig,
} from "./circuitBreakerConfig";

import {
    RecoveryManager,
} from "./recoveryManager";

import type {
    RecoveryPolicy,
} from "./recoveryPolicy";

export interface ResilienceExecuteOptions {
    readonly retryPolicy?:
        Partial<RetryPolicy>;

    readonly retryStrategy?:
        RetryStrategy;

    readonly circuitBreakerConfig?:
        Partial<CircuitBreakerConfig>;

    readonly recoveryPolicy?:
        Partial<RecoveryPolicy>;
}

export class ResilienceManager {
    public readonly retry:
        RetryManager;

    public readonly recovery:
        RecoveryManager;

    private readonly breakers =
        new Map<
            string,
            CircuitBreaker
        >();

    public constructor() {
        this.retry =
            new RetryManager();

        this.recovery =
            new RecoveryManager();
    }

    public getCircuitBreaker(
        key: string,
        config?: Partial<
            CircuitBreakerConfig
        >,
    ): CircuitBreaker {
        let breaker =
            this.breakers.get(
                key,
            );

        if (!breaker) {
            breaker =
                new CircuitBreaker(
                    config,
                );

            this.breakers.set(
                key,
                breaker,
            );
        }

        return breaker;
    }

    public async execute<T>(
        key: string,
        handler: (
            attempt: number,
        ) =>
            T |
            Promise<T>,
        options:
            ResilienceExecuteOptions = {},
    ): Promise<
        RetryResult<T>
    > {
        const breaker =
            this.getCircuitBreaker(
                key,
                options.circuitBreakerConfig,
            );

        const result =
            await this.retry.execute(
                (attempt) =>
                    breaker.execute(
                        () =>
                            handler(
                                attempt,
                            ),
                    ),
                {
                    policy:
                        options.retryPolicy,

                    strategy:
                        options.retryStrategy,
                },
            );

        if (!result.success) {
            await this.recovery.recover(
                result.error,
                {
                    policy:
                        options.recoveryPolicy,
                },
            );
        }

        return result;
    }

    public resetCircuit(
        key: string,
    ): void {
        this.breakers
            .get(key)
            ?.reset();
    }

    public removeCircuit(
        key: string,
    ): boolean {
        return this.breakers.delete(
            key,
        );
    }

    public clearCircuits(): void {
        this.breakers.clear();
    }
}

export const resilienceManager =
    new ResilienceManager();

export default ResilienceManager;
