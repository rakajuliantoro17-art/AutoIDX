/**
==========================================================
AURA Trade OS
Stop Loss Engine
Version : 0.1.0 Alpha
==========================================================
*/

export type StopLossMethod =

    | "FIXED_PERCENT"

    | "FIXED_AMOUNT";



export interface StopLossInput {

    entryPrice: number;

    side: "BUY" | "SELL";

    method: StopLossMethod;

    value: number;

}



export interface StopLossResult {

    stopPrice: number;

    distance: number;

    riskPercent: number;

}



export class StopLossEngine {

    calculate(

        input: StopLossInput

    ): StopLossResult {

        if (

            input.entryPrice <= 0

        ) {

            throw new Error(

                "Invalid entry price."

            );

        }



        if (

            input.value <= 0

        ) {

            throw new Error(

                "Invalid stop loss value."

            );

        }



        let stopPrice =

            input.entryPrice;



        switch (

            input.method

        ) {

            case "FIXED_PERCENT": {

                const distance =

                    input.entryPrice *

                    (

                        input.value / 100

                    );



                stopPrice =

                    input.side === "BUY"

                        ? input.entryPrice -

                          distance

                        : input.entryPrice +

                          distance;

                break;

            }



            case "FIXED_AMOUNT":

                stopPrice =

                    input.side === "BUY"

                        ? input.entryPrice -

                          input.value

                        : input.entryPrice +

                          input.value;

                break;



            default:

                throw new Error(

                    "Unsupported stop loss method."

                );

        }



        const distance =

            Math.abs(

                input.entryPrice -

                stopPrice

            );



        const riskPercent =

            (

                distance /

                input.entryPrice

            ) * 100;



        return {

            stopPrice,

            distance,

            riskPercent,

        };

    }

}



const stopLoss =

    new StopLossEngine();



export default stopLoss;
