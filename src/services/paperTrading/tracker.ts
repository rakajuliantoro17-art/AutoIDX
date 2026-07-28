/**
==========================================================
AURA Trade OS
Paper Trading Tracker
Version : 0.1.0 Alpha
==========================================================
*/


import type {

    PaperEvent,

    PaperEventType

} from "./types";




export interface TrackerFilter {


    type?:PaperEventType;


    startTime?:number;


    endTime?:number;

}




export class PaperTradingTracker {



    private events:

        PaperEvent[];




    constructor(){


        this.events = [];

    }





    /**
     * Add event
     */
    track(

        type:PaperEventType,

        payload:unknown

    ):PaperEvent {



        const event:PaperEvent = {


            id:

                `EV-${Date.now()}-${Math.random()
                    .toString(36)
                    .substring(2,8)}`,



            type,



            payload,



            timestamp:

                Date.now()

        };



        this.events.push(

            event

        );



        return event;

    }





    /**
     * Order created
     */
    trackOrderCreated(

        order:unknown

    ){


        return this.track(

            "ORDER_CREATED",

            order

        );

    }





    /**
     * Order filled
     */
    trackOrderFilled(

        execution:unknown

    ){


        return this.track(

            "ORDER_FILLED",

            execution

        );

    }





    /**
     * Order cancelled
     */
    trackOrderCancelled(

        order:unknown

    ){


        return this.track(

            "ORDER_CANCELLED",

            order

        );

    }





    /**
     * Trade executed
     */
    trackTrade(

        trade:unknown

    ){


        return this.track(

            "TRADE_EXECUTED",

            trade

        );

    }





    /**
     * Balance update
     */
    trackBalance(

        balance:unknown

    ){


        return this.track(

            "BALANCE_UPDATED",

            balance

        );

    }





    /**
     * Position update
     */
    trackPosition(

        position:unknown

    ){


        return this.track(

            "POSITION_UPDATED",

            position

        );

    }





    /**
     * Get all events
     */
    getAll():

        PaperEvent[] {


        return [

            ...this.events

        ];

    }





    /**
     * Filter events
     */
    query(

        filter?:TrackerFilter

    ):

        PaperEvent[] {



        return this.events.filter(

            event => {


                if(

                    filter?.type &&

                    event.type !== filter.type

                ){

                    return false;

                }



                if(

                    filter?.startTime &&

                    event.timestamp < filter.startTime

                ){

                    return false;

                }



                if(

                    filter?.endTime &&

                    event.timestamp > filter.endTime

                ){

                    return false;

                }



                return true;

            }

        );

    }





    /**
     * Latest event
     */
    latest():

        PaperEvent|null {


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
     * Event count
     */
    count():

        number {


        return this.events.length;

    }





    /**
     * Reset tracker
     */
    clear(){

        this.events=[];

    }

}




const paperTracker =

    new PaperTradingTracker();



export default paperTracker;
