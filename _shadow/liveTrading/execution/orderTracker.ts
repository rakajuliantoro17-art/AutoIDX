/**
==========================================================
AURA Trade OS
Live Trading Order Tracker
Version : 0.1.0 Alpha
==========================================================
Order Monitoring & Synchronization Layer
==========================================================
*/


import type {

    LiveOrder,

    OrderStatus,

    ExchangeResponse

}

from "../types";



import indodaxClient

from "../exchange/indodaxClient";






export class OrderTracker {



    private trackedOrders:LiveOrder[] = [];







    /**
     * Register order
     */
    register(

        order:LiveOrder

    ){


        this.trackedOrders.push(

            order

        );


    }







    /**
     * Check single order status
     */
    async check(

        orderId:string

    ):Promise<LiveOrder | null>{



        const order =

            this.trackedOrders.find(

                item =>

                item.id === orderId

            );





        if(!order)

            return null;







        const response =

            await this.fetchStatus(

                order

            );







        if(

            response.success

        ){


            this.updateStatus(

                order,

                response.data

            );


        }







        return order;


    }







    /**
     * Sync all active orders
     */
    async sync(){



        const active =

            this.trackedOrders.filter(

                order =>



                order.status === "PENDING"

                ||

                order.status === "OPEN"



            );







        for(

            const order of active

        ){



            await this.check(

                order.id

            );


        }



        return active;


    }







    /**
     * Fetch exchange order status
     */
    private async fetchStatus(

        order:LiveOrder

    ):Promise<ExchangeResponse>{



        return (

            await indodaxClient.privateRequest(

                "getOrder",

                {


                    pair:

                        order.symbol,


                    order_id:

                        order.exchangeOrderId



                }

            )

        );


    }







    /**
     * Update local status
     */
    private updateStatus(

        order:LiveOrder,

        data:any

    ){



        const status =

            this.normalizeStatus(

                data.status

            );





        order.status =

            status;





        if(

            status === "FILLED"

        ){


            order.executedAt =

                Date.now();


        }



    }







    /**
     * Exchange status mapping
     */
    private normalizeStatus(

        status:string

    ):OrderStatus {



        switch(status){


            case "filled":

                return "FILLED";



            case "cancelled":

                return "CANCELLED";



            case "open":

                return "OPEN";



            default:

                return "PENDING";


        }


    }







    /**
     * Get tracked orders
     */
    getAll(){



        return this.trackedOrders;


    }



}






const orderTracker =

    new OrderTracker();





export default orderTracker;
