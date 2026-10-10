/**
==========================================================
AURA Trade OS
Balance Validator
Version : 0.1.0 Alpha
==========================================================
*/

export interface BalanceValidationInput {

    availableBalance:number;

    requiredAmount:number;

    reserveBalance?:number;

}



export interface BalanceValidationResult {

    valid:boolean;

    availableBalance:number;

    requiredAmount:number;

    remainingBalance:number;

    shortage:number;

    message:string;

}



export class BalanceValidator {

    validate(

        input:BalanceValidationInput

    ):BalanceValidationResult{

        if(

            input.availableBalance<0

        ){

            throw new Error(

                "Invalid available balance."

            );

        }



        if(

            input.requiredAmount<=0

        ){

            throw new Error(

                "Invalid required amount."

            );

        }



        const reserve=

            input.reserveBalance ?? 0;



        const usableBalance=

            Math.max(

                0,

                input.availableBalance-

                reserve

            );



        const remaining=

            usableBalance-

            input.requiredAmount;



        const valid=

            remaining>=0;



        return{

            valid,

            availableBalance:

                usableBalance,

            requiredAmount:

                input.requiredAmount,

            remainingBalance:

                Math.max(

                    remaining,

                    0

                ),

            shortage:

                valid

                    ? 0

                    : Math.abs(

                        remaining

                    ),

            message:

                valid

                    ? "Sufficient balance."

                    : "Insufficient balance.",

        };

    }

}



const balanceValidator=

new BalanceValidator();



export default balanceValidator;
