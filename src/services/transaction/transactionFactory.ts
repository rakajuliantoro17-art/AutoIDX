/**
==========================================================
AURA Trade OS
Transaction Factory
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionType,
} from "./transactionType";

import {
    TransactionStatus,
} from "./transactionStatus";

import {
    createTransactionState,
} from "./transactionState";

import {
    createTransactionMetadata,
} from "./transactionMetadata";

import {
    createTransactionContext,
} from "./transactionContext";

import type {
    Transaction,
} from "./transaction";

export interface CreateTransactionOptions<
    TPayload = unknown,
> {
    readonly id?: string;

    readonly type:
        TransactionType;

    readonly name: string;

    readonly payload: TPayload;

    readonly correlationId?: string;

    readonly causationId?: string;

    readonly metadata?: Parameters<
        typeof createTransactionMetadata
    >[0];

    readonly values?:
        Record<string, unknown>;
}

export class TransactionFactory {
    public create<
        TPayload = unknown,
        TResult = unknown,
    >(
        options:
            CreateTransactionOptions<TPayload>,
    ): Transaction<
        TPayload,
        TResult
    > {
        const id =
            options.id ??
            createTransactionId();

        const state =
            createTransactionState(
                TransactionStatus.CREATED,
            );

        const metadata =
            createTransactionMetadata(
                options.metadata,
            );

        const context =
            createTransactionContext({
                transactionId:
                    id,

                correlationId:
                    options.correlationId,

                causationId:
                    options.causationId,

                metadata,

                values:
                    options.values,
            });

        const timestamp =
            Date.now();

        return {
            id,

            type:
                options.type,

            name:
                options.name,

            payload:
                options.payload,

            state,

            history: [
                state,
            ],

            context,

            createdAt:
                timestamp,

            updatedAt:
                timestamp,

            metadata,
        };
    }
}

export function createTransactionId(): string {
    return [
        "txn",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}

export const transactionFactory =
    new TransactionFactory();

export default TransactionFactory;
