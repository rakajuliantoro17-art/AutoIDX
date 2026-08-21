/**
==========================================================
AURA Trade OS
Live Trading Order Manager
Version : 0.1.0 Alpha
==========================================================
Order Lifecycle Controller
==========================================================
*/


import type {

    LiveOrderRequest,

    LiveOrder,

    LiveExecutionResult

}

from "../types";



import orderExecutor

from "../exchange/orderExecutor";



import fillHandler

from "./fillHandler";







export class OrderManager {



    private orders:LiveOrder[] = [];









    /**
     * Create BUY order
     */
    async buy(

        request:LiveOrderRequest

    ):Promise<LiveExecutionResult>{



        return this.execute({

            ...request,

            side:"BUY"

        });


    }









    /**
     * Create SELL order
     */
    async sell(

        request:LiveOrderRequest

    ):Promise<LiveExecutionResult>{



        return this.execute({

            ...request,

            side:"SELL"

        });


    }









    /**
     * Main order execution flow
     */
    private async execute(

        request:LiveOrderRequest

    ):Promise<LiveExecutionResult>{



        this.validate(request);

        // FIX: orderExecutor (exchange/orderExecutor.ts) di-refactor
        // dari singleton instance jadi factory function
        // createOrderExecutor() -- WAJIB di-await sebelum dipakai,
        // supaya kredensial akun aktif diambil per-panggilan (bukan
        // singleton yang cuma baca 1 env var global). Dipanggil
        // SEKALI di sini, dipakai untuk cabang BUY maupun SELL di
        // bawah supaya tidak fetch akun aktif dua kali per order.
        const executor = await orderExecutor();








        if(

            this.hasDuplicate(

                request

            )

        ){



            throw new Error(

                "Duplicate order blocked"

            );


        }








        const order:LiveOrder={



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



            status:

                "PENDING",



            createdAt:

                Date.now()



        };








        this.orders.push(

            order

        );








        let execution:

            LiveExecutionResult;







        if(

            request.side === "BUY"

        ){



            execution =

                await executor.buy(

                    request

                );


        }

        else {



            execution =

                await executor.sell(

                    request

                );


        }








        this.updateStatus(

            order.id,

            execution

        );








        if(

            execution.success

        ){



            fillHandler.handle(

                execution

            );


        }








        return execution;



    }









    /**
     * Update local order status
     */
    private updateStatus(

        id:string,

        execution:LiveExecutionResult

    ){



        const order =

            this.orders.find(

                item =>

                item.id === id

            );





        if(!order)

            return;







        order.status =

            execution.status;



        order.executedAt =

            execution.timestamp;



    }









    /**
     * Duplicate protection
     */
    private hasDuplicate(

        request:LiveOrderRequest

    ){



        return this.orders.some(

            order =>



            order.symbol ===

            request.symbol &&



            order.side ===

            request.side &&



            order.status ===

            "PENDING"



        );


    }









    /**
     * Validation
     */
    private validate(

        request:LiveOrderRequest

    ){



        if(

            !request.symbol

        )

            throw new Error(

                "Symbol required"

            );






        if(

            request.quantity <= 0

        )

            throw new Error(

                "Invalid quantity"

            );


    }









    /**
     * Get order history
     */
    history(){



        return this.orders;


    }









    /**
     * Generate internal ID
     */
    private generateId(){



        return (

            "ORD-"

            +

            Date.now()

        );


    }



}







const orderManager =

    new OrderManager();





export default orderManager;
