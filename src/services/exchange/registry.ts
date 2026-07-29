/**
==========================================================
AURA Trade OS
Exchange Registry
Version : 0.1.2 Alpha
==========================================================
*/

import type { IExchangeAdapter } from "./adapters/base";
import type { ExchangeName } from "./types";

export class ExchangeRegistry {

    private readonly adapters =
        new Map<ExchangeName, IExchangeAdapter>();

    /**
     * Register adapter.
     */
    register(
        exchange: ExchangeName,
        adapter: IExchangeAdapter
    ): void {
        this.adapters.set(
            exchange,
            adapter
        );
    }

    /**
     * Remove adapter.
     */
    unregister(
        exchange: ExchangeName
    ): void {
        this.adapters.delete(exchange);
    }

    /**
     * Returns adapter.
     */
    get(
        exchange: ExchangeName
    ): IExchangeAdapter {
        const adapter =
            this.adapters.get(exchange);
        if (!adapter) {
            throw new Error(
                `Exchange adapter '${exchange}' is not registered.`
            );
        }
        return adapter;
    }

    /**
     * Checks registration.
     */
    has(
        exchange: ExchangeName
    ): boolean {
        return this.adapters.has(exchange);
    }

    /**
     * Returns registered exchanges.
     */
    list(): ExchangeName[] {
        return [
            ...this.adapters.keys(),
        ];
    }

    /**
     * Clears registry.
     */
    clear(): void {
        this.adapters.clear();
    }

}

export const exchangeRegistry =
    new ExchangeRegistry();

export default exchangeRegistry;
