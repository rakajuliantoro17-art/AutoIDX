/**
==========================================================
AURA Trade OS
Market Ticker Service
Version : 0.1.0 Alpha
==========================================================
*/


export interface TickerData {


    symbol:string;


    last:number;


    open24h:number;


    high24h:number;


    low24h:number;


    volume24h:number;


    change24h:number;


    changePercent:number;


    timestamp:number;

}



export interface PriceUpdate {


    symbol:string;


    price:number;


    volume:number;


    timestamp:number;

}




export class TickerService {



    private tickers:

        Map<string,TickerData>;




    constructor(){


        this.tickers =

            new Map();

    }





    /**
     * Update ticker from websocket
     */
    update(

        data:PriceUpdate

    ):TickerData {



        const symbol =

            data.symbol.toUpperCase();



        const existing =

            this.tickers.get(

                symbol

            );



        if(!existing){



            const ticker:TickerData={


                symbol,


                last:

                    data.price,


                open24h:

                    data.price,


                high24h:

                    data.price,


                low24h:

                    data.price,


                volume24h:

                    data.volume,


                change24h:

                    0,


                changePercent:

                    0,


                timestamp:

                    data.timestamp

            };



            this.tickers.set(

                symbol,

                ticker

            );



            return ticker;

        }





        const change =

            data.price -

            existing.open24h;



        const percent =

            (

                change /

                existing.open24h

            )

            *

            100;





        const updated:TickerData={


            ...existing,



            last:

                data.price,



            high24h:

                Math.max(

                    existing.high24h,

                    data.price

                ),



            low24h:

                Math.min(

                    existing.low24h,

                    data.price

                ),



            volume24h:

                existing.volume24h +

                data.volume,



            change24h:

                change,



            changePercent:

                Number(

                    percent.toFixed(2)

                ),



            timestamp:

                data.timestamp

        };



        this.tickers.set(

            symbol,

            updated

        );



        return updated;

    }





    /**
     * Get ticker
     */
    get(

        symbol:string

    ):

    TickerData|null {



        return (

            this.tickers.get(

                symbol.toUpperCase()

            )

            ??

            null

        );

    }





    /**
     * Get last price
     */
    getPrice(

        symbol:string

    ):

    number|null {


        return (

            this.get(

                symbol

            )

            ?.last

            ??

            null

        );

    }





    /**
     * Get all markets
     */
    getAll():

    TickerData[] {


        return Array.from(

            this.tickers.values()

        );

    }





    /**
     * Remove ticker
     */
    remove(

        symbol:string

    ){


        this.tickers.delete(

            symbol.toUpperCase()

        );

    }





    /**
     * Reset
     */
    clear(){


        this.tickers.clear();

    }

}




const tickerService =

    new TickerService();



export default tickerService;
