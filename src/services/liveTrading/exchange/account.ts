/**
==========================================================
AURA Trade OS
Live Trading Exchange Account
Version : 0.1.0 Alpha
==========================================================
Indodax Account Balance Adapter
==========================================================
*/


import type {

    ExchangeBalance,
    AccountAsset,
    ExchangeResponse

}

from "../types";



import indodaxClient

from "./indodaxClient";








export class ExchangeAccountService {



    private lastBalance:

        ExchangeBalance | null = null;









    /**
     * Get full account balance
     */
    async getBalance()

        :Promise<ExchangeBalance>{



        const response =

            await indodaxClient.privateRequest(

                "getInfo",

                {}

            );






        if(

            !response.success

        ){

            throw new Error(

                response.message

            );

        }







        const balance =

            this.normalizeBalance(

                response

            );







        this.lastBalance =

            balance;







        return balance;


    }









    /**
     * Get single asset balance
     */
    async getAsset(

        symbol:string

    )

        :Promise<AccountAsset | null>{



        const account =

            await this.getBalance();







        return (

            account.assets.find(

                asset =>

                asset.symbol === symbol

            )

            ??

            null

        );


    }









    /**
     * Available IDR
     */
    async getIDRBalance(){



        const asset =

            await this.getAsset(

                "idr"

            );





        return asset

            ?

            asset.available

            :

            0;


    }









    /**
     * Normalize exchange response
     */
    private normalizeBalance(

        response:ExchangeResponse

    ):ExchangeBalance {



        const balance =

            response.data.balance;





        const assets:AccountAsset[]=[];







        Object.keys(

            balance

        )

        .forEach(

            symbol => {



                assets.push({


                    symbol,


                    available:

                        Number(

                            balance[symbol]

                        ),


                    locked:

                        0



                });


            }

        );







        return {


            assets,


            timestamp:

                Date.now()



        };


    }









    /**
     * Cached balance
     */
    getCached(){



        return this.lastBalance;


    }



}







const exchangeAccount =

    new ExchangeAccountService();





export default exchangeAccount;
