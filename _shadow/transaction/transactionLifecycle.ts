/**
==========================================================
AURA Trade OS
Transaction Lifecycle
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionStatus,
} from "./transactionStatus";

import {
    createTransactionState,
} from "./transactionState";

import type {
    Transaction,
} from "./transaction";

import {
    TransactionError,
    TransactionErrorCode,
} from "./transactionError";

const ALLOWED_TRANSITIONS:
    Record<
        TransactionStatus,
        readonly TransactionStatus[]
    > = {
        [TransactionStatus.CREATED]: [
            TransactionStatus.VALIDATING,
            TransactionStatus.CANCELLED,
            TransactionStatus.EXPIRED,
        ],

        [TransactionStatus.VALIDATING]: [
            TransactionStatus.VALIDATED,
            TransactionStatus.FAILED,
            TransactionStatus.CANCELLED,
        ],

        [TransactionStatus.VALIDATED]: [
            TransactionStatus.QUEUED,
            TransactionStatus.EXECUTING,
            TransactionStatus.CANCELLED,
            TransactionStatus.EXPIRED,
        ],

        [TransactionStatus.QUEUED]: [
            TransactionStatus.EXECUTING,
            TransactionStatus.CANCELLED,
            TransactionStatus.EXPIRED,
        ],

        [TransactionStatus.EXECUTING]: [
            TransactionStatus.COMPLETED,
            TransactionStatus.FAILED,
            TransactionStatus.CANCELLED,
            TransactionStatus.ROLLED_BACK,
        ],

        [TransactionStatus.COMPLETED]: [],

        [TransactionStatus.FAILED]: [
            TransactionStatus.ROLLED_BACK,
        ],

        [TransactionStatus.CANCELLED]: [],

        [TransactionStatus.ROLLED_BACK]: [],

        [TransactionStatus.EXPIRED]: [],
    };

export class TransactionLifecycle {
    public canTransition(
        from: TransactionStatus,
        to: TransactionStatus,
    ): boolean {
        return (
            ALLOWED_TRANSITIONS[
                from
            ]?.includes(to) ??
            false
        );
    }

    public transition<
        TPayload,
        TResult,
    >(
        transaction:
            Transaction<TPayload, TResult>,
        status:
            TransactionStatus,
        reason?: string,
    ):
        Transaction<
            TPayload,
            TResult
        > {
        const current =
            transaction.state.status;

        if (
            !this.canTransition(
                current,
                status,
            )
        ) {
            throw new TransactionError(
                `Invalid transaction transition: ${current} -> ${status}`,
                {
                    code:
                        TransactionErrorCode.INVALID_STATE,

                    transactionId:
                        transaction.id,
                },
            );
        }

        const state =
            createTransactionState(
                status,
                {
                    previousStatus:
                        current,

                    reason,
                },
            );

        return {
            ...transaction,

            state,

            history: [
                ...transaction.history,
                state,
            ],

            updatedAt:
                Date.now(),
        };
    }

    public allowedTransitions(
        status:
            TransactionStatus,
    ):
        readonly TransactionStatus[] {
        return [
            ...(
                ALLOWED_TRANSITIONS[
                    status
                ] ?? []
            ),
        ];
    }
}

export default TransactionLifecycle;
