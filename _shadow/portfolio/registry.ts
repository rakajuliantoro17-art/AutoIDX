/**
==========================================================
AURA Trade OS
Portfolio Service Registry
Version : 0.1.0 Alpha
==========================================================
*/


import {

    balanceManager

} from "./balance";


import {

    positionManager,

    positionCalculator

} from "./position";


import {

    realizedPnL,

    unrealizedPnL

} from "./pnl";


import {

    equityCurve,

    drawdownCalculator,

    performanceMetrics

} from "./performance";


import portfolioTracker

from "./tracker";



export interface PortfolioRegistry {


    balance: typeof balanceManager;


    position: typeof positionManager;


    positionCalculator: typeof positionCalculator;



    realizedPnL: typeof realizedPnL;


    unrealizedPnL: typeof unrealizedPnL;



    equityCurve: typeof equityCurve;


    drawdown: typeof drawdownCalculator;


    metrics: typeof performanceMetrics;



    tracker: typeof portfolioTracker;

}



export class PortfolioServiceRegistry {



    private services:

        PortfolioRegistry;



    constructor(){


        this.services = {


            balance:

                balanceManager,



            position:

                positionManager,



            positionCalculator,



            realizedPnL,



            unrealizedPnL,



            equityCurve,



            drawdown:

                drawdownCalculator,



            metrics:

                performanceMetrics,



            tracker:

                portfolioTracker,

        };

    }



    /**
     * Get portfolio services
     */
    get():

        PortfolioRegistry {


        return this.services;

    }



    /**
     * Get specific service
     */
    resolve<

        K extends keyof PortfolioRegistry

    >(

        key:K

    ):PortfolioRegistry[K]{


        return this.services[key];

    }



    /**
     * Replace service
     *
     * Useful for testing
     * or exchange simulation
     */
    register<

        K extends keyof PortfolioRegistry

    >(

        key:K,

        service:PortfolioRegistry[K]

    ):void {


        this.services[key] = service;

    }

}



export const portfolioRegistry =

    new PortfolioServiceRegistry();



export default portfolioRegistry;
