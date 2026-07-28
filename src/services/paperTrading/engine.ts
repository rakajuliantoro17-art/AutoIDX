/**
==========================================================
AURA Trade OS
Paper Trading Engine
Version : 0.1.0 Alpha
==========================================================
*/


import paperAccount, {

    PaperTradingAccount

} from "./account";



export type PaperSignal =

    | "BUY"

    | "SELL"

    | "HOLD";



export interface PaperTradeRequest {


    symbol:string;


    signal:PaperSignal;


    quantity:number;


    price:number;


    confidence:number;


    timestamp?:number;

}



export interface PaperTradeResult {


    success:boolean;


    action:PaperSignal;


    symbol:string;


    quantity:number;


    price:number;


    message:string;


    timestamp:number;

}



export interface PaperEngineConfig {


    minimumConfidence:number;


}



export class PaperTradingEngine {



    private account:

        PaperTradingAccount;



    private config:

        PaperEngineConfig;



    private history:

        PaperTradeResult[];




    constructor(

        account?:PaperTradingAccount,

        config?:Partial<PaperEngineConfig>

    ){



        this.account =

            account ??

            paperAccount;



        this.config = {


            minimumConfidence:

                0.60,


            ...config

        };



        this.history=[];

    }





    /**
     * Execute trading signal
     */
    execute(

        request:PaperTradeRequest

    ):PaperTradeResult {



        const timestamp =

            request.timestamp ??

            Date.now();



        /**
         * Confidence filter
         */
        if(

            request.confidence <

            this.config.minimumConfidence

        ){


            return this.record({

                success:false,

                action:

                    "HOLD",

                symbol:

                    request.symbol,

                quantity:0,

                price:

                    request.price,

                message:

                    "Confidence below threshold.",

                timestamp

            });

        }





        let success = false;



        /**
         * BUY
         */
        if(

            request.signal === "BUY"

        ){


            success =

                this.account.buy(

                    request.symbol,

                    request.quantity,

                    request.price

                );

        }




        /**
         * SELL
         */
        if(

            request.signal === "SELL"

        ){


            success =

                this.account.sell(

                    request.symbol,

                    request.quantity,

                    request.price

                );

        }





        /**
         * HOLD
         */
        if(

            request.signal === "HOLD"

        ){


            return this.record({

                success:true,

                action:"HOLD",

                symbol:

                    request.symbol,

                quantity:0,

                price:

                    request.price,

                message:

                    "No trade executed.",

                timestamp

            });

        }




        return this.record({

            success,

            action:

                request.signal,

            symbol:

                request.symbol,

            quantity:

                success

                    ?

                    request.quantity

                    :

                    0,

            price:

                request.price,

            message:

                success

                    ?

                    "Paper trade executed."

                    :

                    "Trade rejected.",

            timestamp

        });

    }





    /**
     * Current account state
     */
    getAccount(){

        return {

            cash:

                this.account.getCash(),


            assets:

                this.account.getAssets()

        };

    }





    /**
     * Trade history
     */
    getHistory():

        PaperTradeResult[] {


        return [

            ...this.history

        ];

    }





    /**
     * Reset engine
     */
    reset(){

        this.account.reset();

        this.history=[];

    }





    private record(

        trade:PaperTradeResult

    ){


        this.history.push(

            trade

        );


        return trade;

    }


}



const paperTradingEngine =

    new PaperTradingEngine();



export default paperTradingEngine;
