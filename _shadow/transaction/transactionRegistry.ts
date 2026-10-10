/**
==========================================================
AURA Trade OS
Transaction Registry
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionError,
    TransactionErrorCode,
} from "./transactionError";

import type {
    Transaction,
} from "./transaction";

export class TransactionRegistry {
    private readonly items:
        Map<
            string,
            Transaction
        > =
        new Map();

    public register<
        TPayload = unknown,
        TResult = unknown,
    >(
        transaction:
            Transaction<TPayload, TResult>,
    ): void {
        if (
            this.items.has(
                transaction.id,
            )
        ) {
            throw new TransactionError(
                `Transaction already exists: ${transaction.id}`,
                {
                    code:
                        TransactionErrorCode.ALREADY_EXISTS,

                    transactionId:
                        transaction.id,
                },
            );
        }

        this.items.set(
            transaction.id,
            transaction as Transaction,
        );
    }

    public set<
        TPayload = unknown,
        TResult = unknown,
    >(
        transaction:
            Transaction<TPayload, TResult>,
    ): void {
        this.items.set(
            transaction.id,
            transaction as Transaction,
        );
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
        return this.items.get(
            id,
        ) as
            | Transaction<
                  TPayload,
                  TResult
              >
            | undefined;
    }

    public has(
        id: string,
    ): boolean {
        return this.items.has(
            id,
        );
    }

    public remove(
        id: string,
    ): boolean {
        return this.items.delete(
            id,
        );
    }

    public list():
        readonly Transaction[] {
        return [
            ...this.items.values(),
        ];
    }

    public clear(): void {
        this.items.clear();
    }

    public size(): number {
        return this.items.size;
    }
}

export default TransactionRegistry;
