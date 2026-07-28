/**
==========================================================
AURA Trade OS
Volatility Rule
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    RuleResult,
    StrategyContext,
    StrategyRule,

} from "../types";



export class VolatilityRule implements StrategyRule {


    readonly name = "Volatility Rule";



    evaluate(

        context: StrategyContext

    ): RuleResult {


        const {

            atr,

            bollingerUpper,

            bollingerMiddle,

            bollingerLower,

        } = context.indicators;



        const price =

            context.snapshot.close;



        let score = 0;

        const reasons:string[] = [];



        /*
        ==================================================
        ATR
        ==================================================
        */

        if (

            atr !== undefined

        ) {

            const atrPercent =

                (

                    atr /

                    price

                )

                * 100;



            if (

                atrPercent >= 1 &&

                atrPercent <= 3

            ) {

                score += 2;

                reasons.push(

                    "Healthy ATR"

                );

            }

            else if (

                atrPercent < 1

            ) {

                score -= 1;

                reasons.push(

                    "Low volatility"

                );

            }

            else if (

                atrPercent > 5

            ) {

                score -= 2;

                reasons.push(

                    "Extreme volatility"

                );

            }

        }



        /*
        ==================================================
        Bollinger Bands
        ==================================================
        */

        if (

            bollingerUpper !== undefined &&

            bollingerLower !== undefined &&

            bollingerMiddle !== undefined

        ) {

            if (

                price >

                bollingerUpper

            ) {

                score += 1;

                reasons.push(

                    "Upper band breakout"

                );

            }

            else if (

                price <

                bollingerLower

            ) {

                score -= 1;

                reasons.push(

                    "Lower band breakout"

                );

            }

            else if (

                price >

                bollingerMiddle

            ) {

                score += 1;

                reasons.push(

                    "Above middle band"

                );

            }

            else {

                score -= 1;

                reasons.push(

                    "Below middle band"

                );

            }



            const bandwidth =

                (

                    bollingerUpper -

                    bollingerLower

                )

                /

                bollingerMiddle;



            if (

                bandwidth < 0.03

            ) {

                reasons.push(

                    "Bollinger squeeze"

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
