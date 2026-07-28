/**
==========================================================
AURA Trade OS
Candle Builder Engine
Version : 0.1.0 Alpha
==========================================================
*/


export type CandleTimeframe =

    | "1m"
    | "5m"
    | "15m"
    | "1h"
    | "4h"
    | "1d";




export interface MarketTick {


    symbol:string;


    price:number;


    volume:number;


    timestamp:number;

}




export interface Candle {


    symbol:string;


    timeframe:CandleTimeframe;


    open:number;


    high:number;


    low:number;


    close:number;


    volume:number;


    openTime:number;


    closeTime:number;


}





export class CandleBuilder {



    private timeframe:number;



    private current:

        Map<string,Candle>;



    private history:

        Map<string,Candle[]>;




    constructor(

        timeframe:CandleTimeframe = "1m"

    ){


        this.timeframe =

            this.convertTimeframe(

                timeframe

            );


        this.current =

            new Map();


        this.history =

            new Map();

    }





    /**
     * Process incoming tick
     */
    update(

        tick:MarketTick

    ):Candle|null {



        const symbol =

            tick.symbol.toUpperCase();



        const candleStart =

            this.floorTime(

                tick.timestamp

            );



        let candle =

            this.current.get(

                symbol

            );




        /**
         * Create first candle
         */
        if(!candle){


            candle = {

                symbol,

                timeframe:

                    this.getTimeframeName(),


                open:

                    tick.price,


                high:

                    tick.price,


                low:

                    tick.price,


                close:

                    tick.price,


                volume:

                    tick.volume,


                openTime:

                    candleStart,


                closeTime:

                    candleStart +

                    this.timeframe

            };


            this.current.set(

                symbol,

                candle

            );


            return null;

        }





        /**
         * Same candle period
         */
        if(

            candleStart ===

            candle.openTime

        ){


            candle.high =

                Math.max(

                    candle.high,

                    tick.price

                );



            candle.low =

                Math.min(

                    candle.low,

                    tick.price

                );



            candle.close =

                tick.price;



            candle.volume +=

                tick.volume;



            return null;

        }





        /**
         * Candle closed
         */
        const closedCandle =

            {

                ...candle

            };



        this.save(

            closedCandle

        );



        /**
         * New candle
         */
        const newCandle:Candle = {


            symbol,


            timeframe:

                this.getTimeframeName(),



            open:

                tick.price,


            high:

                tick.price,


            low:

                tick.price,


            close:

                tick.price,


            volume:

                tick.volume,


            openTime:

                candleStart,


            closeTime:

                candleStart +

                this.timeframe

        };



        this.current.set(

            symbol,

            newCandle

        );



        return closedCandle;

    }





    /**
     * Get current candle
     */
    getCurrent(

        symbol:string

    ):


        Candle|null {


        return (

            this.current.get(

                symbol.toUpperCase()

            )

            ??

            null

        );

    }





    /**
     * Historical candles
     */
    getHistory(

        symbol:string

    ):


        Candle[] {


        return (

            this.history.get(

                symbol.toUpperCase()

            )

            ??

            []

        );

    }





    private save(

        candle:Candle

    ){


        const list =

            this.history.get(

                candle.symbol

            )

            ??

            [];



        list.push(

            candle

        );



        /**
         * keep latest 1000 candle
         */
        if(

            list.length > 1000

        ){

            list.shift();

        }



        this.history.set(

            candle.symbol,

            list

        );

    }





    private floorTime(

        timestamp:number

    ){


        return (

            Math.floor(

                timestamp /

                this.timeframe

            )

            *

            this.timeframe

        );

    }





    private convertTimeframe(

        tf:CandleTimeframe

    ){


        const map = {


            "1m":60000,


            "5m":300000,


            "15m":900000,


            "1h":3600000,


            "4h":14400000,


            "1d":86400000


        };



        return map[tf];

    }





    private getTimeframeName():

        CandleTimeframe {


        if(this.timeframe===60000)

            return "1m";


        if(this.timeframe===300000)

            return "5m";


        if(this.timeframe===900000)

            return "15m";


        if(this.timeframe===3600000)

            return "1h";


        if(this.timeframe===14400000)

            return "4h";


        return "1d";

    }

}



const candleBuilder =

    new CandleBuilder();



export default candleBuilder;
