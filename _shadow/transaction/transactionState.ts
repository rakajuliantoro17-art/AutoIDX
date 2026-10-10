/**
==========================================================
AURA Trade OS
Transaction State
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionStatus,
} from "./transactionStatus";

export interface TransactionState {
    readonly status: TransactionStatus;

    readonly previousStatus?:
        TransactionStatus;

    readonly changedAt: number;

    readonly reason?: string;

    readonly metadata:
        Record<string, unknown>;
}

export function createTransactionState(
    status: TransactionStatus,
    options: {
        readonly previousStatus?:
            TransactionStatus;

        readonly reason?: string;

        readonly metadata?:
            Record<string, unknown>;
    } = {},
): TransactionState {
    return {
        status,

        previousStatus:
            options.previousStatus,

        changedAt:
            Date.now(),

        reason:
            options.reason,

        metadata:
            options.metadata ?? {},
    };
}
