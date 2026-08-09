/**
==========================================================
AURA Trade OS
Transaction
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionType,
} from "./transactionType";

import {
    TransactionStatus,
} from "./transactionStatus";

import type {
    TransactionState,
} from "./transactionState";

import type {
    TransactionMetadata,
} from "./transactionMetadata";

import type {
    TransactionContext,
} from "./transactionContext";

export interface Transaction<
    TPayload = unknown,
    TResult = unknown,
> {
    readonly id: string;

    readonly type: TransactionType;

    readonly name: string;

    readonly payload: TPayload;

    readonly result?: TResult;

    readonly state: TransactionState;

    readonly history:
        readonly TransactionState[];

    readonly context: TransactionContext;

    readonly createdAt: number;

    readonly updatedAt: number;

    readonly metadata: TransactionMetadata;
}
