/**
==========================================================
AURA Trade OS
Exchange Health Monitor
Version : 0.1.1 Alpha
==========================================================
*/

import { exchangeRegistry } from "./registry";

import type {

    ExchangeName,

} from "./types";

export type ExchangeHealthStatus =

    | "ONLINE"
    | "DEGRADED"
    | "OFFLINE";

export interface ExchangeHealth {

    exchange: ExchangeName;

    status: ExchangeHealthStatus;

    latency: number;

    checkedAt: number;

    message?: string;

}

export class ExchangeHealthMonitor {

    private readonly health =

        new Map<ExchangeName, ExchangeHealth>();

    /**
     * Checks one exchange.
     */
    async check(

        exchange: ExchangeName

    ): Promise<ExchangeHealth> {

        const adapter =

            exchangeRegistry.get(exchange);

        const started =

            Date.now();

        try {

            await adapter.ping();

            const latency =

                Date.now() - started;

            const result: ExchangeHealth = {

                exchange,

                status:

                    latency > 2000

                        ? "DEGRADED"

                        : "ONLINE",

                latency,

                checkedAt: Date.now(),

            };

            this.health.set(

                exchange,

                result

            );

            return result;

        } catch (error) {

            const result: ExchangeHealth = {

                exchange,

                status: "OFFLINE",

                latency: -1,

                checkedAt: Date.now(),

                message:

                    error instanceof Error

                        ? error.message

                        : "Unknown error",

            };

            this.health.set(

                exchange,

                result

            );

            return result;

        }

    }

    /**
     * Checks every registered exchange.
     */
    async checkAll(): Promise<ExchangeHealth[]> {

        const exchanges =

            exchangeRegistry.list();

        return Promise.all(

            exchanges.map(

                exchange =>

                    this.check(exchange)

            )

        );

    }

    /**
     * Returns cached health.
     */
    get(

        exchange: ExchangeName

    ): ExchangeHealth | undefined {

        return this.health.get(exchange);

    }

    /**
     * Returns all cached results.
     */
    getAll(): ExchangeHealth[] {

        return [

            ...this.health.values(),

        ];

    }

}

export const exchangeHealth =

    new ExchangeHealthMonitor();

export default exchangeHealth;
