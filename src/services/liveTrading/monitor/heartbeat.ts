/**
==========================================================
AURA Trade OS
Live Trading Heartbeat Monitor
Version : 0.1.0 Alpha
==========================================================
Engine Runtime Liveness Monitor
==========================================================
*/



export type HeartbeatStatus =


    | "ALIVE"


    | "STALE"


    | "DEAD";







export interface HeartbeatState {


    status:HeartbeatStatus;


    lastBeat:number;


    uptime:number;


    tickCount:number;


}








export class HeartbeatMonitor {



    private startedAt:number;


    private lastBeat:number;


    private tickCount:number = 0;





    private timeout:number;









    constructor(

        timeout:number = 30000

    ){



        this.startedAt =

            Date.now();



        this.lastBeat =

            Date.now();



        this.timeout =

            timeout;



    }









    /**
     * Send heartbeat signal
     */
    beat(){



        this.lastBeat =

            Date.now();



        this.tickCount++;



    }









    /**
     * Check runtime status
     */
    status()

        :HeartbeatState{



        const now =

            Date.now();







        const diff =

            now -

            this.lastBeat;







        let status:

            HeartbeatStatus;







        if(

            diff <= this.timeout

        ){


            status =

                "ALIVE";


        }

        else if(

            diff <= this.timeout * 2

        ){


            status =

                "STALE";


        }

        else {


            status =

                "DEAD";


        }







        return {



            status,



            lastBeat:

                this.lastBeat,



            uptime:

                now -

                this.startedAt,



            tickCount:

                this.tickCount



        };



    }









    /**
     * Reset monitor
     */
    reset(){



        this.startedAt =

            Date.now();



        this.lastBeat =

            Date.now();



        this.tickCount =

            0;



    }



}








const heartbeat =

    new HeartbeatMonitor();





export default heartbeat;
