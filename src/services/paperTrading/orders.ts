/**
==========================================================
AURA Trade OS
Paper Trading Order Manager
Version : 0.1.0 Alpha
==========================================================
*/


import type {

    PaperOrder,

    PaperOrderRequest,

    OrderStatus

} from "./types";




export class PaperOrderManager {



    private orders:

        PaperOrder[];





    constructor(){


        this.orders=[];

    }





    /**
     * Create new order
     */
    create(

        request:PaperOrderRequest

    ):PaperOrder {



        const order:PaperOrder = {


            id:

                this.generateId(),



            symbol:

                request.symbol,



            side:

                request.side,



            type:

                request.type,



            quantity:

                request.quantity,



            filledQuantity:

                0,



            price:

                request.price ?? 0,



            status:

                "PENDING",



            createdAt:

                Date.now()

        };



        this.orders.push(

            order

        );



        return order;

    }





    /**
     * Update order status
     */
    updateStatus(

        orderId:string,

        status:OrderStatus,

        filledQuantity:number = 0

    ):PaperOrder|null {



        const order =

            this.find(

                orderId

            );



        if(!order){

            return null;

        }



        order.status = status;



        if(

            status === "FILLED"

        ){

            order.filledQuantity =

                filledQuantity;



            order.executedAt =

                Date.now();

        }



        return order;

    }





    /**
     * Cancel order
     */
    cancel(

        orderId:string

    ):PaperOrder|null {



        return this.updateStatus(

            orderId,

            "CANCELLED"

        );

    }





    /**
     * Reject order
     */
    reject(

        orderId:string

    ):PaperOrder|null {



        return this.updateStatus(

            orderId,

            "REJECTED"

        );

    }





    /**
     * Find order
     */
    find(

        orderId:string

    ):PaperOrder|null {



        return (

            this.orders.find(

                order =>

                    order.id === orderId

            )

            ??

            null

        );

    }





    /**
     * Active orders
     */
    getOpenOrders():

        PaperOrder[] {



        return this.orders.filter(

            order =>


                order.status === "PENDING"

                ||

                order.status === "OPEN"

        );

    }





    /**
     * All orders
     */
    getAll():

        PaperOrder[] {



        return [

            ...this.orders

        ];

    }





    /**
     * Filled orders
     */
    getFilled():

        PaperOrder[] {



        return this.orders.filter(

            order =>

                order.status === "FILLED"

        );

    }





    /**
     * Reset order book
     */
    clear(){

        this.orders=[];

    }





    private generateId():

        string {



        return (

            "PAPER-ORD-" +

            Date.now()

        );

    }

}



const paperOrders =

    new PaperOrderManager();



export default paperOrders;
