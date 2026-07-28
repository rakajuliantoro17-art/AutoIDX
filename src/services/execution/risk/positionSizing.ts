/**
==========================================================
AURA Trade OS
Position Sizing Engine
Version : 0.1.0 Alpha
==========================================================
*/

export interface PositionSizingInput {

    accountBalance:number;

    riskPercent:number;

    entryPrice:number;

    stopLossPrice:number;

}

export interface PositionSizingResult {

    riskAmount:number;

    riskPerUnit:number;

    quantity:number;

    positionValue:number;

}

export class PositionSizingEngine {

    calculate(

        input:PositionSizingInput

    ):PositionSizingResult{

        if(

            input.accountBalance<=0

        ){

            throw new Error(

                "Invalid account balance."

            );

        }



        if(

            input.riskPercent<=0||

            input.riskPercent>100

        ){

            throw new Error(

                "Invalid risk percent."

            );

        }



        const riskAmount=

            input.accountBalance*

            (input.riskPercent/100);



        const riskPerUnit=

            Math.abs(

                input.entryPrice-

                input.stopLossPrice

            );



        if(

            riskPerUnit===0

        ){

            throw new Error(

                "Entry price and stop loss cannot be equal."

            );

        }



        const quantity=

            riskAmount/

            riskPerUnit;



        return{

            riskAmount,

            riskPerUnit,

            quantity,

            positionValue:

                quantity*

                input.entryPrice,

        };

    }

}



const positionSizing=

new PositionSizingEngine();

export default positionSizing;
