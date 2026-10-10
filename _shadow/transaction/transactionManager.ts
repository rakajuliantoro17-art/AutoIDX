/**
==========================================================
AURA Trade OS
Transaction Manager
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionFactory,
} from "./transactionFactory";

import {
    TransactionRegistry,
} from "./transactionRegistry";

import {
    TransactionLifecycle,
} from "./transactionLifecycle";

import {
    TransactionStatus,
} from "./transactionStatus";

import type {
    Transaction,
} from "./transaction";

import type {
    CreateTransactionOptions,
} from "./transactionFactory";

export class TransactionManager {
    public readonly factory:
        TransactionFactory;

    public readonly registry:
        TransactionRegistry;

    public readonly lifecycle:
        TransactionLifecycle;

    public constructor() {
        this.factory =
            new TransactionFactory();

        this.registry =
            new TransactionRegistry();

        this.lifecycle =
            new TransactionLifecycle();
    }

    public create<
        TPayload = unknown,
        TResult = unknown,
    >(
        options:
            CreateTransactionOptions<TPayload>,
    ):
        Transaction<
            TPayload,
            TResult
        > {
        const transaction =
            this.factory.create<
                TPayload,
                TResult
            >(options);

        this.registry.register(
            transaction,
        );

        return transaction;
    }

    public get<
        TPayload = unknown,
        TResult = unknown,
    >(
        id: string,
    ):
        Transaction<
            TPayload,
            TResult
        > |
        undefined {
        return this.registry.get<
            TPayload,
            TResult
        >(id);
    }

    public transition(
        id: string,
        status:
            TransactionStatus,
        reason?: string,
    ):
        Transaction |
        undefined {
        const transaction =
            this.registry.get(id);

        if (!transaction) {
            return undefined;
        }

        const updated =
            this.lifecycle.transition(
                transaction,
                status,
                reason,
            );

        this.registry.set(
            updated,
        );

        return updated;
    }

    public remove(
        id: string,
    ): boolean {
        return this.registry.remove(
            id,
        );
    }

    public list():
        readonly Transaction[] {
        return this.registry.list();
    }

    public clear(): void {
        this.registry.clear();
    }
}

export const transactionManager =
    new TransactionManager();

export default TransactionManager;
