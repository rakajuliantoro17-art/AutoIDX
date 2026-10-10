/**
==========================================================
AURA Trade OS
Position Manager
Version : 0.1.0 Alpha
==========================================================
*/


export type PositionSide =

    | "LONG"

    | "SHORT";



export interface Position {


    id:string;


    symbol:string;


    side:PositionSide;


    quantity:number;


    averagePrice:number;


    openedAt:number;


    updatedAt:number;


}



export interface PositionUpdate {


    symbol:string;


    quantity:number;


    price:number;


    side:PositionSide;

}



export class PositionManager {


    private positions:

        Map<string, Position>;



    constructor(){

        this.positions =

            new Map();

    }



    /**
     * Open new position
     */
    open(

        update:PositionUpdate

    ):Position {



        const existing =

            this.positions.get(

                update.symbol

            );



        if(existing){

            return this.add(

                update

            );

        }



        const position:Position = {


            id:

                `POS-${Date.now()}`,



            symbol:

                update.symbol,



            side:

                update.side,



            quantity:

                update.quantity,



            averagePrice:

                update.price,



            openedAt:

                Date.now(),



            updatedAt:

                Date.now(),

        };



        this.positions.set(

            update.symbol,

            position

        );



        return position;

    }



    /**
     * Add quantity to existing position
     * with average price calculation
     */
    add(

        update:PositionUpdate

    ):Position {


        const position =

            this.positions.get(

                update.symbol

            );



        if(!position){

            return this.open(

                update

            );

        }



        const totalValue =

            (

                position.quantity *

                position.averagePrice

            )

            +

            (

                update.quantity *

                update.price

            );



        const totalQuantity =

            position.quantity +

            update.quantity;



        position.quantity =

            totalQuantity;



        position.averagePrice =

            totalValue /

            totalQuantity;



        position.updatedAt =

            Date.now();



        return position;

    }



    /**
     * Reduce position
     */
    reduce(

        symbol:string,

        quantity:number

    ):Position|null {



        const position =

            this.positions.get(

                symbol

            );



        if(!position){

            return null;

        }



        position.quantity -=

            quantity;



        position.updatedAt =

            Date.now();



        if(

            position.quantity <= 0

        ){

            this.positions.delete(

                symbol

            );


            return null;

        }



        return position;

    }



    /**
     * Close entire position
     */
    close(

        symbol:string

    ):boolean {


        return this.positions.delete(

            symbol

        );

    }



    /**
     * Get position
     */
    get(

        symbol:string

    ):Position|null {


        return (

            this.positions.get(

                symbol

            )

            ??

            null

        );

    }



    /**
     * Get all positions
     */
    getAll():

        Position[] {


        return [

            ...this.positions.values()

        ];

    }



    /**
     * Calculate total exposure
     */
    exposure(

        prices:

        Record<string,number>

    ):number {


        return this.getAll()

            .reduce(

                (

                    total,

                    position

                ) => {


                    const price =

                        prices[

                            position.symbol

                        ]

                        ??

                        0;



                    return total +

                        (

                            position.quantity *

                            price

                        );


                },

                0

            );

    }



    /**
     * Clear all positions
     */
    clear():void {


        this.positions.clear();

    }

}



const positionManager =

    new PositionManager();



export default positionManager;
