/**
==========================================================
AURA Trade OS
Strategy Registry
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    Strategy,

} from "./types";



export class StrategyRegistry {


    private static readonly strategies =

        new Map<string, Strategy>();



    /**
     * Register strategy.
     */
    static register(

        strategy: Strategy

    ): void {


        this.strategies.set(

            strategy.id,

            strategy

        );

    }



    /**
     * Get strategy by id.
     */
    static get(

        id: string

    ):

        | Strategy

        | undefined {


        return this.strategies.get(

            id

        );

    }



    /**
     * Check strategy exists.
     */
    static has(

        id: string

    ): boolean {


        return this.strategies.has(

            id

        );

    }



    /**
     * Remove strategy.
     */
    static unregister(

        id: string

    ): boolean {


        return this.strategies.delete(

            id

        );

    }



    /**
     * Remove all strategies.
     */
    static clear(): void {


        this.strategies.clear();

    }



    /**
     * Get all registered strategies.
     */
    static all():

        readonly Strategy[] {


        return Array.from(

            this.strategies.values()

        );

    }



    /**
     * Get all strategy ids.
     */
    static ids():

        readonly string[] {


        return Array.from(

            this.strategies.keys()

        );

    }



    /**
     * Number of registered strategies.
     */
    static count(): number {


        return this.strategies.size;

    }

}
