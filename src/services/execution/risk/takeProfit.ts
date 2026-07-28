/**
==========================================================
AURA Trade OS
Take Profit Engine
Version : 0.1.0 Alpha
==========================================================
*/

export type TakeProfitMethod =

    | "FIXED_PERCENT"

    | "FIXED_AMOUNT"

    | "RISK_REWARD";



export interface TakeProfitInput {

    entryPrice: number;

    side: "BUY" | "SELL";

    method: TakeProfitMethod;

    /**
     * Percentage, fixed amount,
     * or Risk:Reward ratio
     */
    value: number;

    /**
     * Required only for
     * RISK_REWARD method.
     */
    stopLossPrice?: number;

}



export interface TakeProfitResult {

    targetPrice: number;

    reward: number;

    rewardPercent: number;

}



export class TakeProfitEngine {

    calculate(

        input: TakeProfitInput

    ): TakeProfitResult {

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

                "Invalid take profit value."

            );

        }



        let targetPrice =

            input.entryPrice;



        switch (

            input.method

        ) {

            case "FIXED_PERCENT": {

                const distance =

                    input.entryPrice *

                    (input.value / 100);



                targetPrice =

                    input.side === "BUY"

                        ? input.entryPrice +

                          distance

                        : input.entryPrice -

                          distance;

                break;

            }



            case "FIXED_AMOUNT":

                targetPrice =

                    input.side === "BUY"

                        ? input.entryPrice +

                          input.value

                        : input.entryPrice -

                          input.value;

                break;



            case "RISK_REWARD": {

                if (

                    input.stopLossPrice ===

                    undefined

                ) {

                    throw new Error(

                        "Stop loss price is required."

                    );

                }



                const risk =

                    Math.abs(

                        input.entryPrice -

                        input.stopLossPrice

                    );



                const reward =

                    risk *

                    input.value;



                targetPrice =

                    input.side === "BUY"

                        ? input.entryPrice +

                          reward

                        : input.entryPrice -

                          reward;

                break;

            }



            default:

                throw new Error(

                    "Unsupported take profit method."

                );

        }



        const reward =

            Math.abs(

                targetPrice -

                input.entryPrice

            );



        return {

            targetPrice,

            reward,

            rewardPercent:

                (

                    reward /

                    input.entryPrice

                ) * 100,

        };

    }

}



const takeProfit =

    new TakeProfitEngine();



export default takeProfit;
