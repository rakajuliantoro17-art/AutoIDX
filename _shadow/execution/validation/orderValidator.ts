/**
==========================================================
AURA Trade OS
Order Validator
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,

} from "../types";



export interface OrderValidationResult {

    valid:boolean;

    errors:string[];

}



export class OrderValidator {

    validate(

        request:ExecutionRequest

    ):OrderValidationResult{

        const errors:string[]=[];



        /*
        ==========================================
        Symbol
        ==========================================
        */

        if(

            !request.symbol||

            request.symbol.trim()===""

        ){

            errors.push(

                "Symbol is required."

            );

        }



        /*
        ==========================================
        Quantity
        ==========================================
        */

        if(

            request.quantity<=0

        ){

            errors.push(

                "Quantity must be greater than zero."

            );

        }



        /*
        ==========================================
        Confidence
        ==========================================
        */

        if(

            request.confidence<0||

            request.confidence>1

        ){

            errors.push(

                "Confidence must be between 0 and 1."

            );

        }



        /*
        ==========================================
        Limit Order
        ==========================================
        */

        if(

            request.orderType==="LIMIT"

        ){

            if(

                request.price===undefined||

                request.price<=0

            ){

                errors.push(

                    "Limit order requires a valid price."

                );

            }

        }



        /*
        ==========================================
        Stop Order
        ==========================================
        */

        if(

            request.orderType==="STOP"

        ){

            if(

                request.stopPrice===undefined||

                request.stopPrice<=0

            ){

                errors.push(

                    "Stop order requires a valid stop price."

                );

            }

        }



        return{

            valid:

                errors.length===0,

            errors,

        };

    }

}



const orderValidator=

new OrderValidator();



export default orderValidator;
