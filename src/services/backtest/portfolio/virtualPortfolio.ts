/**
==========================================================
AURA Trade OS
Backtest Virtual Portfolio
Version : 0.1.0 Alpha
==========================================================
Virtual Trading Account Management
==========================================================
*/


import positionManager, {

    PositionManager,

    Position

}

from "./position";





export interface PortfolioSnapshot {


    timestamp:number;


    cash:number;


    assetValue:number;


    equity:number;


    unrealizedPnL:number;


}







export interface PortfolioConfig {


    initialCapital:number;


    feeRate:number;


}







export interface PortfolioTrade {


    pair:string;


    side:

        | "BUY"

        | "SELL";


    price:number;


    quantity:number;


    value:number;


    timestamp:number;


}








export class VirtualPortfolio {



    private cash:number;


    private initialCapital:number;


    private feeRate:number;


    private positionManager:PositionManager;



    private trades:PortfolioTrade[];







    constructor(

        config:PortfolioConfig

    ){


        this.initialCapital =

            config.initialCapital;



        this.cash =

            config.initialCapital;



        this.feeRate =

            config.feeRate;



        this.positionManager =

            positionManager;



        this.trades=[];



    }









    /**
     * Execute BUY
     */
    buy(

        pair:string,

        price:number,

        amount:number

    ){



        const cost =

            price *

            amount;





        const fee =

            cost *

            this.feeRate;





        const totalCost =

            cost +

            fee;







        if(

            totalCost >

            this.cash

        ){


            throw new Error(

                "Insufficient balance"

            );


        }







        this.cash -=

            totalCost;







        this.positionManager.open(

            pair,

            price,

            cost

        );







        this.trades.push({


            pair,


            side:"BUY",


            price,


            quantity:amount,


            value:totalCost,


            timestamp:Date.now()


        });



    }









    /**
     * Execute SELL
     */
    sell(

        price:number

    ){



        const closed =

            this.positionManager.close(

                price

            );





        if(!closed)

            return null;









        const revenue =

            closed.exitPrice *

            closed.quantity;





        const fee =

            revenue *

            this.feeRate;






        this.cash +=

            revenue -

            fee;







        this.trades.push({


            pair:

                closed.pair,



            side:"SELL",



            price,



            quantity:

                closed.quantity,



            value:

                revenue,



            timestamp:

                Date.now()


        });






        return closed;


    }









    /**
     * Update market value
     */
    updatePrice(

        price:number

    ){



        this.positionManager.updatePrice(

            price

        );


    }









    /**
     * Calculate portfolio equity
     */
    getEquity(){



        const position =

            this.positionManager.get();





        if(!position){


            return this.cash;


        }







        const assetValue =

            position.quantity *

            position.currentPrice;





        return (

            this.cash +

            assetValue

        );


    }









    /**
     * Portfolio snapshot
     */
    snapshot(){




        const position =

            this.positionManager.get();





        const assetValue =

            position

            ?

            position.quantity *

            position.currentPrice

            :

            0;







        return {


            timestamp:

                Date.now(),



            cash:

                this.cash,



            assetValue,



            equity:

                this.cash +

                assetValue,



            unrealizedPnL:

                position

                ?

                position.unrealizedPnL

                :

                0


        };



    }









    /**
     * Get account data
     */
    getBalance(){



        return {


            cash:this.cash,


            equity:this.getEquity(),


            initial:this.initialCapital


        };


    }









    /**
     * Get trade history
     */
    getTrades(){



        return this.trades;


    }



}








export default VirtualPortfolio;
