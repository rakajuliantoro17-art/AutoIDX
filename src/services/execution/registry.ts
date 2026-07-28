/**
==========================================================
AURA Trade OS
Execution Registry
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionEngine,

} from "./executionEngine";



export class ExecutionRegistry {

    private static readonly engines =

        new Map<string, ExecutionEngine>();



    /**
     * Register execution engine.
     */
    static register(

        id: string,

        engine: ExecutionEngine

    ): void {

        this.engines.set(

            id,

            engine

        );

    }



    /**
     * Get execution engine.
     */
    static get(

        id: string

    ): ExecutionEngine | undefined {

        return this.engines.get(

            id

        );

    }



    /**
     * Check engine exists.
     */
    static has(

        id: string

    ): boolean {

        return this.engines.has(

            id

        );

    }



    /**
     * Remove engine.
     */
    static unregister(

        id: string

    ): boolean {

        return this.engines.delete(

            id

        );

    }



    /**
     * Remove all engines.
     */
    static clear(): void {

        this.engines.clear();

    }



    /**
     * Get registered ids.
     */
    static ids():

        readonly string[] {

        return Array.from(

            this.engines.keys()

        );

    }



    /**
     * Get all engines.
     */
    static all():

        readonly ExecutionEngine[] {

        return Array.from(

            this.engines.values()

        );

    }



    /**
     * Total registered engines.
     */
    static count(): number {

        return this.engines.size;

    }

}
