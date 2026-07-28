/**
==========================================================
AURA Trade OS
Momentum Rule
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    RuleResult,
    StrategyContext,
    StrategyRule,

} from "../types";



export class MomentumRule implements StrategyRule {


    readonly name = "Momentum Rule";



    evaluate(

        context: StrategyContext

    ): RuleResult {


        const {

            macd,

            histogram,

            rsi,

        } = context.indicators;



        let score = 0;

        const reasons: string[] = [];



        /*
        ==================================================
        MACD
        ==================================================
        */

        if (

            macd !== undefined

        ) {

            if (

                macd > 0

            ) {

                score += 2;

                reasons.push(

                    "MACD bullish"

                );

            }

            else {

                score -= 2;

                reasons.push(

                    "MACD bearish"

                );

            }

        }



        /*
        ==================================================
        Histogram
        ==================================================
        */

        if (

            histogram !== undefined

        ) {

            if (

                histogram > 0

            ) {

                score += 1;

                reasons.push(

                    "Positive histogram"

                );

            }

            else {

                score -= 1;

                reasons.push(

                    "Negative histogram"

                );

            }

        }



        /*
        ==================================================
        RSI
        ==================================================
        */

        if (

            rsi !== undefined

        ) {

            if (

                rsi >= 55 &&

                rsi <= 70

            ) {

                score += 2;

                reasons.push(

                    "Healthy bullish RSI"

                );

            }

            else if (

                rsi > 70

            ) {

                score -= 1;

                reasons.push(

                    "RSI overbought"

                );

            }

            else if (

                rsi <= 45 &&

                rsi >= 30

            ) {

                score -= 2;

                reasons.push(

                    "Bearish RSI"

                );

            }

            else if (

                rsi < 30

            ) {

                score += 1;

                reasons.push(

                    "RSI oversold (reversal potential)"

                );

            }

        }



        return {

            passed:

                score > 0,

            score,

            reason:

                reasons.join(

                    ", "

                ),

        };

    }

}
