/**
==========================================================
AURA Trade OS
Position Validator
Version : 0.1.0 Alpha
==========================================================
*/

import type {

    ExecutionRequest,

} from "../types";



export interface Position {

    symbol: string;

    quantity: number;

    side: "BUY" | "SELL";

}



export interface PositionValidationInput {

    request: ExecutionRequest;

    positions: readonly Position[];

    maximumPositionSize?: number;

    allowMultiplePositions?: boolean;

}



export interface PositionValidationResult {

    valid: boolean;

    errors: string[];

}



export class PositionValidator {

    validate(

        input: PositionValidationInput

    ): PositionValidationResult {

        const errors: string[] = [];



        const current =

            input.positions.find(

                position =>

                    position.symbol ===

                    input.request.symbol

            );



        /*
        ==========================================
        Multiple Position
        ==========================================
        */

        if (

            !input.allowMultiplePositions &&

            current &&

            input.request.side === "BUY"

        ) {

            errors.push(

                "Position already exists."

            );

        }



        /*
        ==========================================
        Maximum Position Size
        ==========================================
        */

        if (

            current &&

            input.maximumPositionSize !==

            undefined

        ) {

            const total =

                current.quantity +

                input.request.quantity;



            if (

                total >

                input.maximumPositionSize

            ) {

                errors.push(

                    "Maximum position size exceeded."

                );

            }

        }



        /*
        ==========================================
        Sell Validation
        ==========================================
        */

        if (

            input.request.side === "SELL"

        ) {

            if (

                !current

            ) {

                errors.push(

                    "No position available to sell."

                );

            }

            else if (

                input.request.quantity >

                current.quantity

            ) {

                errors.push(

                    "Sell quantity exceeds current position."

                );

            }

        }



        return {

            valid:

                errors.length === 0,

            errors,

        };

    }

}



const positionValidator =

    new PositionValidator();



export default positionValidator;
