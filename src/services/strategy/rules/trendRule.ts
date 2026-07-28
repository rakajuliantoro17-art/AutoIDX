/**
==========================================================
AURA Trade OS
Trend Rule
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    RuleResult,
    StrategyContext,
    StrategyRule,

} from "../types";



export class TrendRule implements StrategyRule {


    readonly name = "Trend Rule";



    evaluate(

        context: StrategyContext

    ): RuleResult {


        const {

            ema,

            sma,

        } = context.indicators;



        let score = 0;

        const reasons: string[] = [];



        /*
        ==================================================
        EMA
        ==================================================
        */

        if (

            ema !== undefined

        ) {

            const price =

                context.snapshot.close;



            if (

                price > ema

            ) {

                score += 2;

                reasons.push(

                    "Price above EMA"

                );

            }

            else if (

                price < ema

            ) {

                score -= 2;

                reasons.push(

                    "Price below EMA"

                );

            }

            else {

                reasons.push(

                    "Price near EMA"

                );

            }

        }



        /*
        ==================================================
        SMA
        ==================================================
        */

        if (

            sma !== undefined

        ) {

            const price =

                context.snapshot.close;



            if (

                price > sma

            ) {

                score += 2;

                reasons.push(

                    "Price above SMA"

                );

            }

            else if (

                price < sma

            ) {

                score -= 2;

                reasons.push(

                    "Price below SMA"

                );

            }

            else {

                reasons.push(

                    "Price near SMA"

                );

            }

        }



        /*
        ==================================================
        Trend Agreement Bonus
        ==================================================
        */

        if (

            ema !== undefined &&

            sma !== undefined

        ) {

            const price =

                context.snapshot.close;



            if (

                price > ema &&

                price > sma

            ) {

                score += 1;

                reasons.push(

                    "EMA & SMA aligned bullish"

                );

            }

            else if (

                price < ema &&

                price < sma

            ) {

                score -= 1;

                reasons.push(

                    "EMA & SMA aligned bearish"

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
