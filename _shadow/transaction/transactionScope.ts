/**
==========================================================
AURA Trade OS
Transaction Scope
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    TransactionContext,
} from "./transactionContext";

import type {
    ExecutionContext,
} from "./executionContext";

export class TransactionScope {
    private readonly values:
        Map<
            string,
            unknown
        > =
        new Map();

    public constructor(
        public readonly transaction:
            TransactionContext,

        public readonly execution?:
            ExecutionContext,
    ) {}

    public set<T>(
        key: string,
        value: T,
    ): void {
        this.values.set(
            key,
            value,
        );
    }

    public get<T>(
        key: string,
    ): T | undefined {
        return this.values.get(
            key,
        ) as T | undefined;
    }

    public has(
        key: string,
    ): boolean {
        return this.values.has(
            key,
        );
    }

    public delete(
        key: string,
    ): boolean {
        return this.values.delete(
            key,
        );
    }

    public clear(): void {
        this.values.clear();
    }

    public snapshot():
        Record<string, unknown> {
        return Object.fromEntries(
            this.values.entries(),
        );
    }
}

export default TransactionScope;
