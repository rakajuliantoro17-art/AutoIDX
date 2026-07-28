/**
==========================================================
AURA Trade OS
Live Trading Health Monitor
Version : 0.1.0 Alpha
==========================================================
System Health Monitoring Layer
==========================================================
*/


import indodaxClient

from "../exchange/indodaxClient";



import orderTracker

from "../execution/orderTracker";







export type HealthStatus =


    | "HEALTHY"


    | "WARNING"


    | "CRITICAL"


    | "OFFLINE";








export interface HealthReport {


    status:HealthStatus;


    exchange:boolean;


    orders:boolean;


    engine:boolean;


    uptime:number;


    issues:string[];


    timestamp:number;


}









export class HealthMonitor {



    private startedAt:number;





    private engineActive:boolean = false;








    constructor(){



        this.startedAt =

            Date.now();



    }









    /**
     * Run complete health check
     */
    async check()

        :Promise<HealthReport>{





        const issues:string[]=[];





        const exchange =

            await this.checkExchange();







        if(!exchange){


            issues.push(

                "Exchange connection failed"

            );


        }








        const orders =

            this.checkOrders();







        if(!orders){


            issues.push(

                "Order tracker inactive"

            );


        }







        const engine =

            this.engineActive;







        if(!engine){


            issues.push(

                "Trading engine inactive"

            );


        }








        return {



            status:

                this.calculateStatus(

                    issues

                ),



            exchange,


            orders,


            engine,



            uptime:

                Date.now()

                -

                this.startedAt,



            issues,



            timestamp:

                Date.now()



        };



    }









    /**
     * Check exchange API
     */
    private async checkExchange()

        :Promise<boolean>{



        try {



            return await (

                indodaxClient.ping()

            );



        }

        catch{


            return false;


        }


    }









    /**
     * Check order system
     */
    private checkOrders(){



        try {



            const orders =

                orderTracker.getAll();




            return Array.isArray(

                orders

            );



        }

        catch{


            return false;


        }


    }









    /**
     * Engine heartbeat
     */
    heartbeat(

        active:boolean

    ){



        this.engineActive =

            active;



    }









    /**
     * Determine health level
     */
    private calculateStatus(

        issues:string[]

    ):HealthStatus {



        if(

            issues.length === 0

        )

            return "HEALTHY";







        if(

            issues.length === 1

        )

            return "WARNING";







        if(

            issues.length >= 2

        )

            return "CRITICAL";







        return "OFFLINE";


    }



}








const healthMonitor =

    new HealthMonitor();





export default healthMonitor;
