/**
==========================================================
AURA Trade OS
Indodax WebSocket Client
Version : 0.1.0 Alpha
==========================================================
*/


export interface MarketTick {


    symbol:string;


    price:number;


    volume:number;


    timestamp:number;

}



export interface SocketConfig {


    url:string;


    reconnectDelay:number;


    heartbeatInterval:number;

}




export type SocketEvent =

    | "CONNECTED"

    | "DISCONNECTED"

    | "TICK"

    | "ERROR";




type Listener = (

    data:any

)=>void;




export class IndodaxSocket {



    private ws:

        WebSocket|null;



    private config:

        SocketConfig;



    private listeners:

        Map<SocketEvent,Listener[]>;



    private reconnectTimer:

        any;



    private heartbeatTimer:

        any;




    constructor(

        config?:Partial<SocketConfig>

    ){



        this.config={


            url:

            "wss://ws3.indodax.com/ws/",



            reconnectDelay:

                5000,



            heartbeatInterval:

                30000,



            ...config

        };



        this.ws=null;



        this.listeners=

            new Map();



    }





    /**
     * Connect websocket
     */
    connect(){



        if(this.ws){

            return;

        }



        this.ws=

            new WebSocket(

                this.config.url

            );




        this.ws.onopen = ()=>{


            this.emit(

                "CONNECTED",

                true

            );


            this.startHeartbeat();


        };




        this.ws.onmessage = (

            event

        )=>{


            this.handleMessage(

                event.data

            );


        };





        this.ws.onerror = (

            error

        )=>{


            this.emit(

                "ERROR",

                error

            );


        };





        this.ws.onclose = ()=>{


            this.emit(

                "DISCONNECTED",

                true

            );



            this.stopHeartbeat();



            this.reconnect();

        };


    }





    /**
     * Subscribe pair
     */
    subscribe(

        symbol:string

    ){



        if(!this.ws){

            throw new Error(

                "Socket not connected."

            );

        }



        const pair =

            symbol

            .toLowerCase()

            .replace(

                "_",

                ""

            );



        this.send({

            method:

                "subscribeTicker",



            params:{

                pair

            }



        });


    }





    /**
     * Send message
     */
    private send(

        data:any

    ){


        if(

            this.ws &&

            this.ws.readyState ===

            WebSocket.OPEN

        ){


            this.ws.send(

                JSON.stringify(data)

            );

        }

    }





    /**
     * Parse incoming data
     */
    private handleMessage(

        raw:string

    ){



        try{


            const data =

                JSON.parse(

                    raw

                );



            if(

                data.ticker

            ){


                const tick:MarketTick={



                    symbol:

                        data.channel

                        ?

                        data.channel

                        :

                        "UNKNOWN",



                    price:

                        Number(

                            data.ticker.last

                        ),



                    volume:

                        Number(

                            data.ticker.vol_idr

                        ),



                    timestamp:

                        Date.now()

                };



                this.emit(

                    "TICK",

                    tick

                );


            }



        }

        catch(error){


            this.emit(

                "ERROR",

                error

            );

        }

    }





    /**
     * Event listener
     */
    on(

        event:SocketEvent,

        callback:Listener

    ){



        const list =

            this.listeners.get(

                event

            )

            ??

            [];



        list.push(

            callback

        );



        this.listeners.set(

            event,

            list

        );


    }





    private emit(

        event:SocketEvent,

        data:any

    ){



        const list =

            this.listeners.get(

                event

            )

            ??

            [];



        list.forEach(

            callback =>

                callback(data)

        );

    }





    /**
     * Heartbeat
     */
    private startHeartbeat(){



        this.heartbeatTimer =

            setInterval(()=>{


                this.send({

                    method:"ping"

                });


            },

            this.config.heartbeatInterval

        );

    }





    private stopHeartbeat(){


        clearInterval(

            this.heartbeatTimer

        );

    }





    /**
     * Auto reconnect
     */
    private reconnect(){



        clearTimeout(

            this.reconnectTimer

        );



        this.reconnectTimer =

            setTimeout(()=>{


                this.ws=null;



                this.connect();



            },

            this.config.reconnectDelay

        );


    }





    /**
     * Close socket
     */
    close(){



        this.stopHeartbeat();



        if(this.ws){


            this.ws.close();



            this.ws=null;

        }


    }

}



const indodaxSocket =

    new IndodaxSocket();



export default indodaxSocket;
