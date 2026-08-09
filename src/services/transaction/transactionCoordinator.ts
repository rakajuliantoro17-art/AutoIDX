/**
==========================================================
AURA Trade OS
Transaction Coordinator
Version : 0.0.7 Alpha
==========================================================
*/

import {
    TransactionManager,
} from "./transactionManager";

import {
    TransactionExecutor,
} from "./transactionExecutor";

import {
    createExecutionContext,
} from "./executionContext";

import type {
    Transaction,
} from "./transaction";

import type {
    TransactionResult,
} from "./transactionResult";

export class TransactionCoordinator {
    public readonly manager:
        TransactionManager;

    public readonly executor:
        TransactionExecutor;

    public constructor(
        manager:
            TransactionManager =
                new TransactionManager(),
        executor:
            TransactionExecutor =
                new TransactionExecutor(),
    ) {
        this.manager =
            manager;

        this.executor =
            executor;
    }

    public async run<
        TPayload,
        TResult,
    >(
        transaction:
            Transaction<
                TPayload,
                TResult
            >,
        handler:
            (
                payload: TPayload,
                context: ReturnType<
                    typeof createExecutionContext
                >,
            ) =>
                TResult |
                Promise<TResult>,
    ): Promise<{
        readonly transaction:
            Transaction<
                TPayload,
                TResult
            >;

        readonly result:
            TransactionResult<TResult>;
    }> {
        this.manager.registry.set(
            transaction,
        );

        const context =
            createExecutionContext({
                transactionId:
                    transaction.id,

                correlationId:
                    transaction.context
                        .correlationId,

                causationId:
                    transaction.context
                        .causationId,

                metadata:
                    {
                        strategyId:
                            transaction.metadata
                                .strategyId,

                        symbol:
                            transaction.metadata
                                .symbol,

                        tags:
                            transaction.metadata
                                .tags,

                        values:
                            transaction.metadata
                                .values,
                    },
            });

        const execution =
            await this.executor.execute(
                transaction,
                context,
                handler,
            );

        this.manager.registry.set(
            execution.transaction,
        );

        return execution;
    }
}

export const transactionCoordinator =
    new TransactionCoordinator();

export default TransactionCoordinator;
