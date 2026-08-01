/**
==========================================================
AURA Trade OS
Live Trading Engine
Version : 0.1.0 Alpha
==========================================================
Main Runtime Orchestrator
==========================================================
*/


import marketService

from "./exchange/market";


import riskManager

from "./risk/riskManager";


import orderManager

from "./execution/orderManager";


import orderTracker

from "./execution/orderTracker";


import healthMonitor

from "./monitor/health";


import heartbeat

from "./monitor/heartbeat";








export type EngineStatus =


    | "STOPPED"


    | "STARTING"


    | "RUNNING"


    | "PAUSED"


    | "ERROR";








export interface TradingSignal {


    symbol:string;


    action:

        | "BUY"

        | "SELL"

        | "HOLD";


    quantity:number;


    price:number;


    confidence:number;


}









export class LiveTradingEngine {



    private status:

        EngineStatus = "STOPPED";




    private running:boolean = false;







    private interval?:NodeJS.Timeout;








    constructor(){}





    /**
     * Start trading engine
     */
    async start(){



        if(

            this.running

        ){

            return;

        }







        this.status =

            "STARTING";







        this.running =

            true;







        heartbeat.reset();






        healthMonitor.heartbeat(

            true

        );







        this.interval =

            setInterval(

                ()=>{


                    this.loop();


                },

                5000

            );








        this.status =

            "RUNNING";





    }









    /**
     * Main trading loop
     */
    private async loop(){



        try {



            heartbeat.beat();







            const health =

                await healthMonitor.check();







            if(

                health.status ===

                "CRITICAL"

            ){



                this.pause(

                    "Health critical"

                );


                return;

            }







            /*
            =================================
            Market monitoring
            =================================
            */


            // Placeholder

            // Strategy Engine Phase 14

            // will inject signals here





            await orderTracker.sync();






        }

        catch(error){



            this.status =

                "ERROR";



            this.stop();



        }



    }









    /**
     * Execute signal
     */
    async executeSignal(

        signal:TradingSignal,

        balance:number

    ){



        if(

            signal.action ===

            "HOLD"

        ){

            return null;

        }








        const orderValue =



            signal.quantity

            *

            signal.price;








        const risk =

            riskManager.evaluate({

                symbol:

                    signal.symbol,


                orderValue,


                balance,


                confidence:

                    signal.confidence


            });








        if(

            !risk.approved

        ){



            return {


                success:false,

                message:

                    risk.reason


            };


        }








        if(

            signal.action ===

            "BUY"

        ){



            return await orderManager.buy({

                symbol:

                    signal.symbol,


                side:

                    "BUY",

                type:

                    "MARKET",


                quantity:

                    signal.quantity,


                price:

                    signal.price


            });


        }








        return await orderManager.sell({

                symbol:

                    signal.symbol,


                side:

                    "SELL",

                type:

                    "MARKET",


                quantity:

                    signal.quantity,


                price:

                    signal.price


            });



    }









    /**
     * Stop engine
     */
    stop(){



        this.running =

            false;







        if(

            this.interval

        ){



            clearInterval(

                this.interval

            );


        }







        healthMonitor.heartbeat(

            false

        );







        this.status =

            "STOPPED";



    }









    /**
     * Emergency pause
     */
    pause(

        reason:string

    ){



        console.warn(

            "AURA paused:",

            reason

        );







        this.status =

            "PAUSED";



        this.running =

            false;



    }









    getStatus(){



        return {


            status:

                this.status,


            running:

                this.running,


            heartbeat:

                heartbeat.status()



        };


    }



}








const liveTradingEngine =

    new LiveTradingEngine();





export default liveTradingEngine;
