/**
==========================================================
AURA Trade OS
Portfolio Manager
Version : 0.1.0 Alpha
==========================================================
*/


import {

    portfolioRegistry

} from "./registry";


import type {

    PortfolioSnapshot,

    PortfolioState,

    BalanceUpdate,

    TradeRecord,

    PortfolioPosition

} from "./types";



export class PortfolioManager {



    private services;



    constructor(){


        this.services =

            portfolioRegistry.get();

    }




    /**
     * Get portfolio state
     */
    state():

        PortfolioState {


        const balances =

            this.services.balance

                .getAll();



        const positions =

            this.services.position

                .getAll();



        const trades:

            TradeRecord[] = [];



        const snapshot =

            this.snapshot();



        return {


            balances,


            positions:
                positions as unknown as PortfolioPosition[],


            trades,


            snapshot,

        };

    }




    /**
     * Update balance
     */
    updateBalance(

        update:BalanceUpdate

    ){


        const result =

            this.services.balance

                .update(

                    update

                );



        this.services.tracker

            .trackBalance(

                result

            );



        return result;

    }




    /**
     * Open position
     */
    openPosition(

        position: {

            symbol:string;

            quantity:number;

            price:number;

            side:"LONG"|"SHORT";

        }

    ){


        const result =

            this.services.position

                .open(

                    position

                );



        this.services.tracker

            .trackPositionOpen(

                result as any

            );



        return result;

    }




    /**
     * Close position
     */
    closePosition(

        symbol:string

    ):boolean {



        const position =

            this.services.position

                .get(

                    symbol

                );



        if(!position){

            return false;

        }



        const result =

            this.services.position

                .close(

                    symbol

                );



        if(result){


            this.services.tracker

                .trackPositionClose(

                    position as any

                );

        }



        return result;

    }




    /**
     * Record trade
     */
    recordTrade(

        trade:TradeRecord

    ){


        return this.services.tracker

            .trackTrade(

                trade

            );

    }




    /**
     * Create portfolio snapshot
     */
    snapshot():

        PortfolioSnapshot {


        const balances =

            this.services.balance

                .getAll();



        const cashBalance =

            balances

            .filter(

                item =>

                    item.asset === "IDR"

            )

            .reduce(

                (

                    total,

                    item

                ) =>

                    total +

                    item.available,

                0

            );



        const positions =

            this.services.position

                .getAll();



        const investedValue =

            positions.reduce(

                (

                    total,

                    position

                ) =>


                    total +

                    (

                        position.quantity *

                        position.averagePrice

                    ),

                0

            );



        const snapshot:PortfolioSnapshot = {


            timestamp:

                Date.now(),



            totalEquity:

                cashBalance +

                investedValue,



            cashBalance,



            investedValue,



            unrealizedPnL:0,



            realizedPnL:

                this.services.realizedPnL

                    .total([]),



            holdings:[],

        };



        this.services.equityCurve

            .add(

                snapshot.totalEquity,

                snapshot.timestamp

            );



        this.services.tracker

            .trackSnapshot(

                snapshot

            );



        return snapshot;

    }




    /**
     * Reset portfolio
     */
    clear():void {


        this.services.balance

            .clear();



        this.services.position

            .clear();



        this.services.equityCurve

            .clear();



        this.services.tracker

            .clear();

    }


}



const portfolioManager =

    new PortfolioManager();



export default portfolioManager;
