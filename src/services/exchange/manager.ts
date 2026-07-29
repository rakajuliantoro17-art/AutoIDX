/**
==========================================================
AURA Trade OS
Exchange Manager
Version : 0.1.2 Alpha
==========================================================
*/

import {
    exchangeRegistry,
} from "./registry";
import type {
    IExchangeAdapter,
} from "./adapters/base";
import type {
    ExchangeName,
} from "./types";

export class ExchangeManager {

    private activeExchange?: ExchangeName;

    /**
     * Sets active exchange.
     */
    setActive(
        exchange: ExchangeName
    ): void {
        if (
            !exchangeRegistry.has(
                exchange
            )
        ) {
            throw new Error(
                `Exchange '${exchange}' is not registered.`
            );
        }
        this.activeExchange =
            exchange;
    }

    /**
     * Returns active exchange.
     */
    getActive(): ExchangeName {
        if (
            !this.activeExchange
        ) {
            throw new Error(
                "No active exchange selected."
            );
        }
        return this.activeExchange;
    }

    /**
     * Returns active adapter.
     */
    getAdapter(): IExchangeAdapter {
        return exchangeRegistry.get(
            this.getActive()
        );
    }

    /**
     * Registers exchange.
     */
    register(
        exchange: ExchangeName,
        adapter: IExchangeAdapter
    ): void {
        exchangeRegistry.register(
            exchange,
            adapter
        );
    }

    /**
     * Removes exchange.
     */
    unregister(
        exchange: ExchangeName
    ): void {
        exchangeRegistry.unregister(
            exchange
        );
    }

    /**
     * Lists registered exchanges.
     */
    list(): ExchangeName[] {
        return exchangeRegistry.list();
    }

}

export const exchangeManager =
new ExchangeManager();

export default exchangeManager;
