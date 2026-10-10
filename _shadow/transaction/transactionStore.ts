/**
==========================================================
AURA Trade OS
Transaction Store
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    Transaction,
} from "./transaction";

export interface TransactionStore {
    save(
        transaction:
            Transaction,
    ):
        void |
        Promise<void>;

    get(
        id: string,
    ):
        Transaction |
        undefined |
        Promise<
            Transaction |
            undefined
        >;

    delete(
        id: string,
    ):
        boolean |
        Promise<boolean>;

    list():
        readonly Transaction[] |
        Promise<
            readonly Transaction[]
        >;
}

export class MemoryTransactionStore
    implements TransactionStore {

    private readonly items:
        Map<
            string,
            Transaction
        > =
        new Map();

    public save(
        transaction:
            Transaction,
    ): void {
        this.items.set(
            transaction.id,
            transaction,
        );
    }

    public get(
        id: string,
    ):
        Transaction |
        undefined {
        return this.items.get(
            id,
        );
    }

    public delete(
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
}

export default MemoryTransactionStore;
