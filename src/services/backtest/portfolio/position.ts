/**
==========================================================
AURA Trade OS
Backtest Virtual Position
Version : 0.1.0 Alpha
==========================================================
Virtual Spot Trading Position Manager
==========================================================
*/


export type PositionSide =

    | "LONG"

    | "NONE";







export interface Position {


    pair:string;


    side:PositionSide;


    quantity:number;


    entryPrice:number;


    currentPrice:number;


    invested:number;


    unrealizedPnL:number;


    openedAt:number;


}







export interface ClosedPosition {


    pair:string;


    entryPrice:number;


    exitPrice:number;


    quantity:number;


    profitLoss:number;


    returnPercent:number;


    openedAt:number;


    closedAt:number;


}









export class PositionManager {



    private position:Position | null;





    constructor(){


        this.position=null;


    }









    /**
     * Open new long position
     */
    open(

        pair:string,

        price:number,

        capital:number

    ):Position {



        const quantity =

            capital /

            price;





        this.position={


            pair,


            side:"LONG",



            quantity,



            entryPrice:

                price,



            currentPrice:

                price,



            invested:

                capital,



            unrealizedPnL:

                0,



            openedAt:

                Date.now()



        };





        return this.position;


    }









    /**
     * Update market price
     */
    updatePrice(

        price:number

    ){



        if(!this.position)

            return null;





        this.position.currentPrice=

            price;





        this.position.unrealizedPnL =

            (

                price -

                this.position.entryPrice

            )

            *

            this.position.quantity;





        return this.position;


    }









    /**
     * Close position
     */
    close(

        price:number

    ):ClosedPosition|null {



        if(!this.position)

            return null;





        const profitLoss =

            (

                price -

                this.position.entryPrice

            )

            *

            this.position.quantity;







        const returnPercent =

            (

                profitLoss /

                this.position.invested

            )

            *

            100;








        const result:ClosedPosition={



            pair:

                this.position.pair,



            entryPrice:

                this.position.entryPrice,



            exitPrice:

                price,



            quantity:

                this.position.quantity,



            profitLoss,



            returnPercent,



            openedAt:

                this.position.openedAt,



            closedAt:

                Date.now()


        };







        this.position=null;





        return result;


    }









    /**
     * Get current position
     */
    get(){

        return this.position;

    }









    /**
     * Check open position
     */
    hasPosition(){



        return this.position !== null;


    }



}







const positionManager =

    new PositionManager();





export default positionManager;
