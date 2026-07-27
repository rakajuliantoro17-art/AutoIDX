/**
==========================================================
AURA Trade OS
Exchange Registry
Version : 0.1.1 Alpha
==========================================================
*/

import type { ExchangeAdapter } from "./adapters/base";

import type { ExchangeName } from "./types";

export class ExchangeRegistry {

    private readonly adapters =

        new Map<ExchangeName, ExchangeAdapter>();

    /**
     * Register adapter.
     */
    register(

        exchange: ExchangeName,

        adapter: ExchangeAdapter

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

    ): ExchangeAdapter {

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
