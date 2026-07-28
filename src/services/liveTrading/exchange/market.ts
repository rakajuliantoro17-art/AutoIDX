/**
==========================================================
AURA Trade OS
Indodax Market Service
Version : 0.1.0 Alpha
==========================================================
Live Market Data Adapter
==========================================================
*/


import indodaxClient

from "./indodaxClient";



import type {

    MarketTick,

    MarketCandle,

    ExchangeResponse

}

from "../types";







export class ExchangeMarketService {



    /**
     * Get ticker
     */
    async getTicker(

        symbol:string

    ):Promise<MarketTick>{



        const response =

            await indodaxClient.publicRequest(

                `${symbol}/ticker`

            );






        if(

            !response.success

        ){

            throw new Error(

                response.message

            );

        }







        return this.normalizeTicker(

            response

        );



    }









    /**
     * Get last price
     */
    async getPrice(

        symbol:string

    ):Promise<number>{



        const ticker =

            await this.getTicker(

                symbol

            );





        return ticker.price;


    }









    /**
     * Normalize ticker response
     */
    private normalizeTicker(

        response:ExchangeResponse

    ):MarketTick {



        const ticker =

            response.data.ticker;






        return {


            symbol:

                response.data.symbol

                ??

                "",



            bid:

                Number(

                    ticker.buy

                ),



            ask:

                Number(

                    ticker.sell

                ),



            price:

                Number(

                    ticker.last

                ),



            volume:

                Number(

                    ticker.vol_btc

                    ??

                    0

                ),



            timestamp:

                Date.now()



        };


    }









    /**
     * Generate candle
     *
     * Placeholder for websocket/candle builder
     */
    buildCandle(

        tick:MarketTick,

        previous?:MarketCandle

    ):MarketCandle {



        if(!previous){



            return {


                symbol:

                    tick.symbol,


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


                timestamp:

                    tick.timestamp



            };



        }









        return {



            symbol:

                tick.symbol,



            open:

                previous.open,



            high:

                Math.max(

                    previous.high,

                    tick.price

                ),



            low:

                Math.min(

                    previous.low,

                    tick.price

                ),



            close:

                tick.price,



            volume:

                previous.volume +

                tick.volume,



            timestamp:

                tick.timestamp



        };



    }



}








const exchangeMarket =

    new ExchangeMarketService();





export default exchangeMarket;
