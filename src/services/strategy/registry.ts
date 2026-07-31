/**
==========================================================
AURA Trade OS
Strategy Registry
Version : 0.1.0 Alpha
==========================================================
Dynamic Strategy Plugin Registry
==========================================================
*/


import type {

    StrategyDefinition

}

from "./core/strategyEngine";

import type {

    StrategyStatus

}

from "./types";

export interface StrategyRegistryItem {

    name:string;

    description:string;

    version:string;

    status:StrategyStatus;

    strategy:StrategyDefinition;

}



import auraTrend

from "./strategies/auraTrend";



import emaCrossover

from "./strategies/emaCrossover";



import momentumStrategy

from "./strategies/momentum";







export class StrategyRegistry {



    private strategies:

        Map<string,StrategyRegistryItem>;






    constructor(){


        this.strategies =

            new Map();



        this.initialize();



    }









    /**
     * Load default strategies
     */
    private initialize(){



        this.register(

        {


            name:"AURA_TREND",


            description:

            "Hybrid EMA MACD ADX RSI strategy",


            version:"0.1.0",


            status:"ACTIVE",


            strategy:auraTrend as StrategyDefinition


        });



        this.register(

        {


            name:"EMA_CROSSOVER",


            description:

            "Simple EMA trend following strategy",


            version:"0.1.0",


            status:"ACTIVE",


            strategy:emaCrossover as StrategyDefinition


        });




        this.register(

        {


            name:"MOMENTUM",


            description:

            "RSI Stochastic MACD momentum strategy",


            version:"0.1.0",


            status:"ACTIVE",


            strategy:momentumStrategy as StrategyDefinition


        });



    }









    /**
     * Register new strategy
     */
    register(

        item:StrategyRegistryItem

    ){



        this.strategies.set(

            item.name,

            item

        );


    }









    /**
     * Get strategy
     */
    get(

        name:string

    ){



        return this.strategies.get(

            name

        );



    }









    /**
     * Check strategy exists
     */
    has(

        name:string

    ){



        return this.strategies.has(

            name

        );



    }









    /**
     * Get all strategies
     */
    all(){



        return Array.from(

            this.strategies.values()

        );


    }









    /**
     * Enable strategy
     */
    enable(

        name:string

    ){



        const strategy =

            this.strategies.get(

                name

            );





        if(!strategy)

            return false;





        strategy.status="ACTIVE";


        return true;


    }









    /**
     * Disable strategy
     */
    disable(

        name:string

    ){



        const strategy =

            this.strategies.get(

                name

            );





        if(!strategy)

            return false;





        strategy.status="DISABLED";


        return true;


    }









    /**
     * Get active strategies
     */
    active(){



        return this.all()

        .filter(

            item =>

            item.status==="ACTIVE"

        );


    }



}







const strategyRegistry =

    new StrategyRegistry();





export default strategyRegistry;
