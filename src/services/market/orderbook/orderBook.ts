/**
==========================================================
AURA Trade OS
Order Book Engine
Version : 0.1.0 Alpha
==========================================================
*/


export interface OrderBookLevel {


    price:number;


    quantity:number;


}



export interface OrderBookSnapshot {


    symbol:string;


    bids:OrderBookLevel[];


    asks:OrderBookLevel[];


    timestamp:number;


}




export interface OrderBookMetrics {


    bestBid:number;


    bestAsk:number;


    spread:number;


    bidVolume:number;


    askVolume:number;


    imbalance:number;


}




export class OrderBookEngine {



    private books:

        Map<string,OrderBookSnapshot>;




    constructor(){


        this.books =

            new Map();

    }





    /**
     * Update order book
     */
    update(

        symbol:string,

        bids:[number,number][],

        asks:[number,number][]

    ){



        const normalized =

            symbol.toUpperCase();



        const snapshot:OrderBookSnapshot = {


            symbol:normalized,


            bids:

                bids

                .map(

                    item => ({

                        price:item[0],

                        quantity:item[1]

                    })

                )

                .sort(

                    (a,b)=>

                        b.price -

                        a.price

                ),



            asks:

                asks

                .map(

                    item => ({

                        price:item[0],

                        quantity:item[1]

                    })

                )

                .sort(

                    (a,b)=>

                        a.price -

                        b.price

                ),



            timestamp:

                Date.now()

        };



        this.books.set(

            normalized,

            snapshot

        );



        return snapshot;

    }





    /**
     * Get order book
     */
    get(

        symbol:string

    ):

    OrderBookSnapshot|null {



        return (

            this.books.get(

                symbol.toUpperCase()

            )

            ??

            null

        );

    }





    /**
     * Calculate market depth
     */
    metrics(

        symbol:string

    ):

    OrderBookMetrics|null {



        const book =

            this.get(

                symbol

            );



        if(!book){

            return null;

        }




        const bestBid =

            book.bids[0]?.price

            ??

            0;



        const bestAsk =

            book.asks[0]?.price

            ??

            0;



        const bidVolume =

            book.bids.reduce(

                (

                    total,

                    level

                )=>

                    total +

                    level.quantity,

                0

            );



        const askVolume =

            book.asks.reduce(

                (

                    total,

                    level

                )=>

                    total +

                    level.quantity,

                0

            );



        const total =

            bidVolume +

            askVolume;



        return {


            bestBid,


            bestAsk,


            spread:

                bestAsk -

                bestBid,


            bidVolume,


            askVolume,


            imbalance:

                total === 0

                    ?

                    0

                    :

                    (

                        bidVolume -

                        askVolume

                    )

                    /

                    total


        };

    }





    /**
     * Best bid
     */
    getBestBid(

        symbol:string

    ){

        return (

            this.get(symbol)

            ?.bids[0]

            ??

            null

        );

    }





    /**
     * Best ask
     */
    getBestAsk(

        symbol:string

    ){

        return (

            this.get(symbol)

            ?.asks[0]

            ??

            null

        );

    }





    /**
     * Clear data
     */
    clear(){

        this.books.clear();

    }





    /**
     * Reset
     */
    reset(){

        this.clear();

    }

}





const orderBook =

    new OrderBookEngine();



export default orderBook;
