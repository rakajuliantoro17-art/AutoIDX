/**
==========================================================
AURA Trade OS
Retry Manager
Version : 0.0.8 Alpha
==========================================================
*/

import {
    RetryFactory,
} from "./retryFactory";

import {
    RetryRegistry,
} from "./retryRegistry";

import {
    RetryExecutor,
    type RetryExecutorOptions,
    type RetryHandler,
} from "./retryExecutor";

import type {
    RetryResult,
} from "./retryResult";

export class RetryManager {
    public readonly factory:
        RetryFactory;

    public readonly registry:
        RetryRegistry;

    public readonly executor:
        RetryExecutor;

    public constructor() {
        this.factory =
            new RetryFactory();

        this.registry =
            new RetryRegistry();

        this.executor =
            new RetryExecutor();
    }

    public async execute<T>(
        handler:
            RetryHandler<T>,
        options:
            RetryExecutorOptions = {},
    ): Promise<RetryResult<T>> {
        return this.executor.execute(
            handler,
            options,
        );
    }

    public create(
        options = {},
    ) {
        const context =
            this.factory.create(
                options,
            );

        this.registry.register(
            context,
        );

        return context;
    }

    public get(
        retryId: string,
    ) {
        return this.registry.get(
            retryId,
        );
    }

    public remove(
        retryId: string,
    ): boolean {
        return this.registry.remove(
            retryId,
        );
    }

    public clear(): void {
        this.registry.clear();
    }
}

export const retryManager =
    new RetryManager();

export default RetryManager;
