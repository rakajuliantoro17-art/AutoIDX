/**
==========================================================
AURA Trade OS
Strategy Engine
Version : 0.1.1 Alpha
==========================================================
*/

import {

    StrategyRegistry,

} from "./registry";

import type {

    Strategy,

    StrategyContext,

    StrategyDecision,

} from "./types";



export interface StrategyEngineOptions {

    defaultStrategyId?: string;

}



export class StrategyEngine {


    private readonly defaultStrategyId?: string;



    constructor(

        options: StrategyEngineOptions = {}

    ) {

        this.defaultStrategyId =

            options.defaultStrategyId;

    }



    /**
     * Execute a specific strategy.
     */
    execute(

        strategyId: string,

        context: StrategyContext

    ): StrategyDecision {


        const strategy =

            StrategyRegistry.get(

                strategyId

            );


        if (!strategy) {

            throw new Error(

                `Strategy "${strategyId}" not found.`

            );

        }


        return strategy.evaluate(

            context

        );

    }



    /**
     * Execute default strategy.
     */
    executeDefault(

        context: StrategyContext

    ): StrategyDecision {


        if (

            !this.defaultStrategyId

        ) {

            throw new Error(

                "Default strategy is not configured."

            );

        }


        return this.execute(

            this.defaultStrategyId,

            context

        );

    }



    /**
     * Execute every registered strategy.
     */
    executeAll(

        context: StrategyContext

    ): StrategyDecision[] {


        return StrategyRegistry

            .all()

            .map(

                strategy =>

                    strategy.evaluate(

                        context

                    )

            );

    }



    /**
     * Execute only selected strategies.
     */
    executeSelected(

        strategyIds: readonly string[],

        context: StrategyContext

    ): StrategyDecision[] {


        const decisions: StrategyDecision[] = [];


        for (

            const id of strategyIds

        ) {


            const strategy =

                StrategyRegistry.get(

                    id

                );


            if (

                strategy

            ) {

                decisions.push(

                    strategy.evaluate(

                        context

                    )

                );

            }

        }


        return decisions;

    }



    /**
     * Get registered strategy.
     */
    getStrategy(

        id: string

    ):

        | Strategy

        | undefined {


        return StrategyRegistry.get(

            id

        );

    }



    /**
     * List available strategies.
     */
    listStrategies():

        readonly Strategy[] {


        return StrategyRegistry.all();

    }

}
