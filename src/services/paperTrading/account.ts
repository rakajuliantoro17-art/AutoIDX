/**
==========================================================
AURA Trade OS
Paper Trading Account
Version : 0.1.0 Alpha
==========================================================
*/


export interface AccountAsset {


    symbol:string;


    balance:number;


    averagePrice:number;


}



export interface AccountTransaction {


    id:string;


    type:

        | "DEPOSIT"

        | "WITHDRAW"

        | "BUY"

        | "SELL";



    symbol:string;


    amount:number;


    price:number;


    timestamp:number;


}



export interface AccountSnapshot {


    cash:number;


    equity:number;


    assets:AccountAsset[];


    timestamp:number;


}



export interface PaperAccountConfig {


    initialCash:number;


    baseCurrency:string;


}



export class PaperTradingAccount {



    private cash:number;


    private assets:

        Map<string, AccountAsset>;



    private transactions:

        AccountTransaction[];



    private config:

        PaperAccountConfig;




    constructor(

        config?:Partial<PaperAccountConfig>

    ){


        this.config = {


            initialCash:

                10000000,


            baseCurrency:

                "IDR",



            ...config

        };



        this.cash =

            this.config.initialCash;



        this.assets =

            new Map();



        this.transactions = [];

    }




    /**
     * Deposit virtual balance
     */
    deposit(

        amount:number

    ):void {



        if(amount <= 0)

            throw new Error(

                "Invalid deposit amount."

            );



        this.cash += amount;



        this.record({

            type:"DEPOSIT",

            symbol:this.config.baseCurrency,

            amount,

            price:1

        });

    }




    /**
     * Withdraw virtual balance
     */
    withdraw(

        amount:number

    ):boolean {



        if(

            amount > this.cash

        ){

            return false;

        }



        this.cash -= amount;



        this.record({

            type:"WITHDRAW",

            symbol:this.config.baseCurrency,

            amount,

            price:1

        });



        return true;

    }




    /**
     * Buy asset
     */
    buy(

        symbol:string,

        quantity:number,

        price:number

    ):boolean {



        const cost =

            quantity *

            price;



        if(

            cost > this.cash

        ){

            return false;

        }



        this.cash -= cost;



        const current =

            this.assets.get(

                symbol

            );



        if(current){


            const totalQuantity =

                current.balance +

                quantity;



            current.averagePrice =


                (

                    (

                        current.balance *

                        current.averagePrice

                    )

                    +

                    (

                        quantity *

                        price

                    )

                )

                /

                totalQuantity;



            current.balance =

                totalQuantity;


        }

        else {


            this.assets.set(

                symbol,

                {

                    symbol,

                    balance:quantity,

                    averagePrice:price

                }

            );

        }



        this.record({

            type:"BUY",

            symbol,

            amount:quantity,

            price

        });



        return true;

    }




    /**
     * Sell asset
     */
    sell(

        symbol:string,

        quantity:number,

        price:number

    ):boolean {



        const asset =

            this.assets.get(

                symbol

            );



        if(

            !asset ||

            asset.balance < quantity

        ){

            return false;

        }



        asset.balance -= quantity;



        this.cash +=

            quantity *

            price;



        this.record({

            type:"SELL",

            symbol,

            amount:quantity,

            price

        });



        return true;

    }




    /**
     * Get cash balance
     */
    getCash():

        number {


        return this.cash;

    }




    /**
     * Get asset
     */
    getAsset(

        symbol:string

    ):

        AccountAsset|null {



        return (

            this.assets.get(

                symbol

            )

            ??

            null

        );

    }




    /**
     * Get all assets
     */
    getAssets():

        AccountAsset[] {


        return Array.from(

            this.assets.values()

        );

    }




    /**
     * Portfolio snapshot
     */
    snapshot(

        prices:Record<string,number>

    ):

        AccountSnapshot {



        let equity =

            this.cash;



        const assets =

            this.getAssets();



        for(

            const asset of assets

        ){


            const price =

                prices[

                    asset.symbol

                ]

                ??

                asset.averagePrice;



            equity +=

                asset.balance *

                price;

        }



        return {


            cash:

                this.cash,


            equity,


            assets,


            timestamp:

                Date.now()

        };

    }




    /**
     * Transaction logger
     */
    private record(

        data:Omit<AccountTransaction,

        "id"|"timestamp">

    ){


        this.transactions.push({


            id:

                `TX-${Date.now()}`,



            timestamp:

                Date.now(),



            ...data


        });

    }




    getTransactions():

        AccountTransaction[] {


        return [

            ...this.transactions

        ];

    }




    reset():void {


        this.cash =

            this.config.initialCash;



        this.assets.clear();


        this.transactions=[];

    }

}



const paperAccount =

    new PaperTradingAccount();



export default paperAccount;
