/**
==========================================================
AURA Trade OS
Circuit Breaker
Version : 0.0.8 Alpha
==========================================================
*/

import {
    CircuitBreakerState,
} from "./circuitBreakerState";

import {
    normalizeCircuitBreakerConfig,
    type CircuitBreakerConfig,
} from "./circuitBreakerConfig";

export class CircuitBreakerOpenError
    extends Error {
    public constructor(
        message =
            "Circuit breaker is open",
    ) {
        super(message);

        this.name =
            "CircuitBreakerOpenError";
    }
}

export class CircuitBreaker {
    private state:
        CircuitBreakerState =
        CircuitBreakerState.CLOSED;

    private failures = 0;

    private lastFailureAt = 0;

    private halfOpenAttempts = 0;

    private readonly config:
        CircuitBreakerConfig;

    public constructor(
        config?: Partial<
            CircuitBreakerConfig
        >,
    ) {
        this.config =
            normalizeCircuitBreakerConfig(
                config,
            );
    }

    public getState():
        CircuitBreakerState {
        if (
            this.state ===
                CircuitBreakerState.OPEN &&
            this.canReset()
        ) {
            this.state =
                CircuitBreakerState.HALF_OPEN;

            this.halfOpenAttempts = 0;
        }

        return this.state;
    }

    public async execute<T>(
        handler: () =>
            T |
            Promise<T>,
    ): Promise<T> {
        const state =
            this.getState();

        if (
            state ===
            CircuitBreakerState.OPEN
        ) {
            throw new CircuitBreakerOpenError();
        }

        if (
            state ===
            CircuitBreakerState.HALF_OPEN
        ) {
            if (
                this.halfOpenAttempts >=
                this.config
                    .halfOpenMaxAttempts
            ) {
                throw new CircuitBreakerOpenError(
                    "Circuit breaker is waiting for recovery",
                );
            }

            this.halfOpenAttempts++;
        }

        try {
            const result =
                await handler();

            this.recordSuccess();

            return result;
        } catch (error) {
            this.recordFailure();

            throw error;
        }
    }

    public recordSuccess(): void {
        this.failures = 0;
        this.lastFailureAt = 0;
        this.halfOpenAttempts = 0;
        this.state =
            CircuitBreakerState.CLOSED;
    }

    public recordFailure(): void {
        this.failures++;
        this.lastFailureAt =
            Date.now();

        if (
            this.failures >=
            this.config.failureThreshold
        ) {
            this.state =
                CircuitBreakerState.OPEN;
        }
    }

    public reset(): void {
        this.failures = 0;
        this.lastFailureAt = 0;
        this.halfOpenAttempts = 0;

        this.state =
            CircuitBreakerState.CLOSED;
    }

    public getFailureCount(): number {
        return this.failures;
    }

    public getConfig():
        CircuitBreakerConfig {
        return this.config;
    }

    private canReset(): boolean {
        return (
            Date.now() -
                this.lastFailureAt >=
            this.config.resetTimeoutMs
        );
    }
}

export default CircuitBreaker;
