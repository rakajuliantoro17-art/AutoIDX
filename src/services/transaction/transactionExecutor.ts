/**
==========================================================
AURA Trade OS
Transaction Executor
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionStatus,
} from "./transactionStatus";

import {
    TransactionLifecycle,
} from "./transactionLifecycle";

import {
    createTransactionSuccess,
    createTransactionFailure,
} from "./transactionResult";

import {
    TransactionError,
    TransactionErrorCode,
} from "./transactionError";

import type {
    Transaction,
} from "./transaction";

import type {
    TransactionResult,
} from "./transactionResult";

import type {
    ExecutionContext,
} from "./executionContext";

export type TransactionExecutionHandler<
    TPayload = unknown,
    TResult = unknown,
> = (
    payload: TPayload,
    context: ExecutionContext,
) =>
    TResult |
    Promise<TResult>;

export class TransactionExecutor {
    private readonly lifecycle:
        TransactionLifecycle;

    public constructor(
        lifecycle:
            TransactionLifecycle =
                new TransactionLifecycle(),
    ) {
        this.lifecycle =
            lifecycle;
    }

    public async execute<
        TPayload,
        TResult,
    >(
        transaction:
            Transaction<TPayload, TResult>,
        context:
            ExecutionContext,
        handler:
            TransactionExecutionHandler<
                TPayload,
                TResult
            >,
    ): Promise<{
        readonly transaction:
            Transaction<
                TPayload,
                TResult
            >;

        readonly result:
            TransactionResult<TResult>;
    }> {
        const startedAt =
            Date.now();

        let current =
            transaction;

        try {
            if (
                current.state.status ===
                TransactionStatus.CREATED
            ) {
                current =
                    this.lifecycle.transition(
                        current,
                        TransactionStatus.VALIDATING,
                    );

                current =
                    this.lifecycle.transition(
                        current,
                        TransactionStatus.VALIDATED,
                    );
            }

            if (
                current.state.status ===
                TransactionStatus.VALIDATED
            ) {
                current =
                    this.lifecycle.transition(
                        current,
                        TransactionStatus.EXECUTING,
                    );
            }

            const data =
                await handler(
                    current.payload,
                    context,
                );

            current =
                this.lifecycle.transition(
                    current,
                    TransactionStatus.COMPLETED,
                );

            const result =
                createTransactionSuccess(
                    current.id,
                    data,
                    {
                        startedAt,
                    },
                );

            return {
                transaction: {
                    ...current,

                    result:
                        data,
                },

                result,
            };
        } catch (error) {
            try {
                if (
                    current.state.status ===
                    TransactionStatus.EXECUTING
                ) {
                    current =
                        this.lifecycle.transition(
                            current,
                            TransactionStatus.FAILED,
                        );
                } else if (
                    current.state.status ===
                    TransactionStatus.VALIDATING
                ) {
                    current =
                        this.lifecycle.transition(
                            current,
                            TransactionStatus.FAILED,
                        );
                }
            } catch {
                // Preserve original execution error.
            }

            const wrapped =
                error instanceof
                TransactionError
                    ? error
                    : new TransactionError(
                          "Transaction execution failed",
                          {
                              code:
                                  TransactionErrorCode.EXECUTION_FAILED,

                              transactionId:
                                  current.id,

                              cause:
                                  error,
                          },
                      );

            return {
                transaction:
                    current,

                result:
                    createTransactionFailure(
                        current.id,
                        wrapped,
                        {
                            startedAt,
                        },
                    ),
            };
        }
    }
}

export default TransactionExecutor;
