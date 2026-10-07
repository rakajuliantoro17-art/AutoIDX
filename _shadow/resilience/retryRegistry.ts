/**
==========================================================
AURA Trade OS
Retry Registry
Version : 0.0.8 Alpha
==========================================================
*/

import type {
    RetryContext,
} from "./retryContext";

export class RetryRegistry {
    private readonly items =
        new Map<
            string,
            RetryContext
        >();

    public register(
        context: RetryContext,
    ): void {
        this.items.set(
            context.retryId,
            context,
        );
    }

    public get(
        retryId: string,
    ):
        RetryContext |
        undefined {
        return this.items.get(
            retryId,
        );
    }

    public has(
        retryId: string,
    ): boolean {
        return this.items.has(
            retryId,
        );
    }

    public remove(
        retryId: string,
    ): boolean {
        return this.items.delete(
            retryId,
        );
    }

    public list():
        readonly RetryContext[] {
        return [
            ...this.items.values(),
        ];
    }

    public clear(): void {
        this.items.clear();
    }
}

export default RetryRegistry;
