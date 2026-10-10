/**
==========================================================
AURA Trade OS
Market WebSocket Manager
Version : 0.1.0 Alpha
==========================================================
*/


import indodaxSocket, {

    IndodaxSocket,

    MarketTick

} from "./indodaxSocket";



export type ConnectionStatus =

    | "CONNECTED"

    | "DISCONNECTED"

    | "CONNECTING"

    | "ERROR";




export interface Subscription {


    symbol:string;


    active:boolean;


    subscribedAt:number;


}



export class MarketWebSocketManager {



    private socket:

        IndodaxSocket;



    private subscriptions:

        Map<string,Subscription>;



    private status:

        ConnectionStatus;



    private ticks:

        Map<string,MarketTick>;




    constructor(

        socket?:IndodaxSocket

    ){


        this.socket =

            socket ??

            indodaxSocket;



        this.subscriptions =

            new Map();



        this.ticks =

            new Map();



        this.status =

            "DISCONNECTED";

    }





    /**
     * Initialize websocket
     */
    start(){


        this.status =

            "CONNECTING";



        this.socket.connect();




        this.socket.on(

            "CONNECTED",

            ()=>{


                this.status =

                    "CONNECTED";



                this.restoreSubscriptions();



            }

        );





        this.socket.on(

            "DISCONNECTED",

            ()=>{


                this.status =

                    "DISCONNECTED";

            }

        );





        this.socket.on(

            "ERROR",

            ()=>{


                this.status =

                    "ERROR";

            }

        );





        this.socket.on(

            "TICK",

            (

                tick:MarketTick

            )=>{


                this.handleTick(

                    tick

                );


            }

        );

    }





    /**
     * Add market subscription
     */
    subscribe(

        symbol:string

    ){


        const normalized =

            this.normalize(

                symbol

            );



        this.subscriptions.set(

            normalized,

            {

                symbol:normalized,

                active:true,

                subscribedAt:

                    Date.now()

            }

        );



        if(

            this.status ===

            "CONNECTED"

        ){


            this.socket.subscribe(

                normalized

            );


        }

    }





    /**
     * Remove subscription
     */
    unsubscribe(

        symbol:string

    ){



        const normalized =

            this.normalize(

                symbol

            );



        this.subscriptions.delete(

            normalized

        );


    }





    /**
     * Restore after reconnect
     */
    private restoreSubscriptions(){



        for(

            const subscription of

            this.subscriptions.values()

        ){


            if(

                subscription.active

            ){


                this.socket.subscribe(

                    subscription.symbol

                );

            }

        }

    }





    /**
     * Receive tick
     */
    private handleTick(

        tick:MarketTick

    ){



        const symbol =

            this.normalize(

                tick.symbol

            );



        this.ticks.set(

            symbol,

            {

                ...tick,

                symbol

            }

        );

    }





    /**
     * Last market price
     */
    getTick(

        symbol:string

    ):

        MarketTick|null {



        return (

            this.ticks.get(

                this.normalize(

                    symbol

                )

            )

            ??

            null

        );

    }





    /**
     * All active subscriptions
     */
    getSubscriptions():

        Subscription[] {


        return Array.from(

            this.subscriptions.values()

        );

    }





    /**
     * Connection state
     */
    getStatus():

        ConnectionStatus {


        return this.status;

    }





    /**
     * Normalize pair
     */
    private normalize(

        symbol:string

    ){


        return symbol

            .toUpperCase()

            .replace(

                "-",

                "_"

            );

    }





    /**
     * Shutdown
     */
    stop(){


        this.socket.close();


        this.status =

            "DISCONNECTED";


        this.subscriptions.clear();


        this.ticks.clear();


    }


}




const marketSocketManager =

    new MarketWebSocketManager();



export default marketSocketManager;
