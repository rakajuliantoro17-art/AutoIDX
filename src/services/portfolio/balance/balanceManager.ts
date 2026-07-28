/**
==========================================================
AURA Trade OS
Balance Manager
Version : 0.1.0 Alpha
==========================================================
*/


import type {

    Balance,

    BalanceUpdate,

} from "../types";



export class BalanceManager {


    private balances:

        Map<string, Balance>;



    constructor(){

        this.balances =

            new Map();

    }



    /**
     * Initialize balance.
     */
    setBalance(

        balance: Balance

    ): void {


        this.balances.set(

            balance.asset,

            balance

        );

    }



    /**
     * Get balance by asset.
     */
    getBalance(

        asset:string

    ): Balance | null {


        return (

            this.balances.get(

                asset

            )

            ??

            null

        );

    }



    /**
     * Get all balances.
     */
    getAll():

        Balance[] {


        return [

            ...this.balances.values()

        ];

    }



    /**
     * Update balance.
     */
    update(

        update: BalanceUpdate

    ): Balance {


        const current =

            this.getBalance(

                update.asset

            );



        const balance: Balance = {


            asset:

                update.asset,



            total:

                (

                    current?.total

                    ??

                    0

                )

                +

                (

                    update.amount

                ),



            available:

                (

                    current?.available

                    ??

                    0

                )

                +

                (

                    update.amount

                ),



            locked:

                current?.locked

                ??

                0,



            updatedAt:

                Date.now(),

        };



        this.balances.set(

            update.asset,

            balance

        );



        return balance;

    }



    /**
     * Lock balance for order.
     */
    lock(

        asset:string,

        amount:number

    ):boolean {


        const balance =

            this.getBalance(

                asset

            );



        if(

            !balance

            ||

            balance.available < amount

        ){

            return false;

        }



        balance.available -= amount;

        balance.locked += amount;



        balance.updatedAt =

            Date.now();



        return true;

    }



    /**
     * Unlock locked balance.
     */
    unlock(

        asset:string,

        amount:number

    ):boolean {


        const balance =

            this.getBalance(

                asset

            );



        if(

            !balance

            ||

            balance.locked < amount

        ){

            return false;

        }



        balance.locked -= amount;

        balance.available += amount;



        balance.updatedAt =

            Date.now();



        return true;

    }



    /**
     * Calculate total portfolio value.
     */
    calculateValue(

        prices:

        Record<string,number>

    ):number {


        return this.getAll()

            .reduce(

                (

                    total,

                    balance

                ) => {


                    const price =

                        prices[

                            balance.asset

                        ]

                        ??

                        0;



                    return (

                        total +

                        (

                            balance.total *

                            price

                        )

                    );


                },

                0

            );

    }



    /**
     * Clear portfolio.
     */
    clear():void {


        this.balances.clear();

    }

}



const balanceManager =

    new BalanceManager();



export default balanceManager;
