/**
==========================================================
AURA Trade OS
Portfolio Tracker
Version : 0.1.0 Alpha
==========================================================
*/


import type {

    PortfolioSnapshot,

    TradeRecord,

    Balance,

    PortfolioPosition,

} from "./types";



export type PortfolioEventType =

    | "BALANCE_UPDATE"

    | "POSITION_OPEN"

    | "POSITION_CLOSE"

    | "TRADE_EXECUTED"

    | "SNAPSHOT";



export interface PortfolioEvent {


    id:string;


    type:PortfolioEventType;


    timestamp:number;


    data:unknown;

}



export class PortfolioTracker {


    private events:

        PortfolioEvent[];



    constructor(){

        this.events = [];

    }



    /**
     * Record generic event
     */
    record(

        type:PortfolioEventType,

        data:unknown

    ):PortfolioEvent {


        const event:PortfolioEvent = {


            id:

                `EVT-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2,8)}`,



            type,



            timestamp:

                Date.now(),



            data,

        };



        this.events.push(

            event

        );



        return event;

    }



    /**
     * Track balance update
     */
    trackBalance(

        balance:Balance

    ):PortfolioEvent {


        return this.record(

            "BALANCE_UPDATE",

            balance

        );

    }



    /**
     * Track opened position
     */
    trackPositionOpen(

        position:PortfolioPosition

    ):PortfolioEvent {


        return this.record(

            "POSITION_OPEN",

            position

        );

    }



    /**
     * Track closed position
     */
    trackPositionClose(

        position:PortfolioPosition

    ):PortfolioEvent {


        return this.record(

            "POSITION_CLOSE",

            position

        );

    }



    /**
     * Track executed trade
     */
    trackTrade(

        trade:TradeRecord

    ):PortfolioEvent {


        return this.record(

            "TRADE_EXECUTED",

            trade

        );

    }



    /**
     * Track portfolio snapshot
     */
    trackSnapshot(

        snapshot:PortfolioSnapshot

    ):PortfolioEvent {


        return this.record(

            "SNAPSHOT",

            snapshot

        );

    }



    /**
     * Get all events
     */
    getEvents():

        PortfolioEvent[] {


        return [

            ...this.events

        ];

    }



    /**
     * Get latest event
     */
    latest():

        PortfolioEvent|null {


        if(

            this.events.length === 0

        ){

            return null;

        }



        return this.events[

            this.events.length - 1

        ];

    }



    /**
     * Filter events by type
     */
    getByType(

        type:PortfolioEventType

    ):PortfolioEvent[] {


        return this.events.filter(

            event =>

                event.type === type

        );

    }



    /**
     * Clear history
     */
    clear():void {


        this.events = [];

    }



    /**
     * Total event count
     */
    count():number {


        return this.events.length;

    }

}



const portfolioTracker =

    new PortfolioTracker();



export default portfolioTracker;
