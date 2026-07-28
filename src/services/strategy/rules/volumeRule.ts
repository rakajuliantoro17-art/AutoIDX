/**
==========================================================
AURA Trade OS
Volume Rule
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    RuleResult,
    StrategyContext,
    StrategyRule,

} from "../types";



export class VolumeRule implements StrategyRule {


    readonly name = "Volume Rule";



    evaluate(

        context: StrategyContext

    ): RuleResult {


        const {

            obv,

        } = context.indicators;



        let score = 0;

        const reasons: string[] = [];



        /*
        ==================================================
        OBV
        ==================================================
        */

        if (

            obv === undefined

        ) {

            return {

                passed: false,

                score: 0,

                reason: "OBV unavailable",

            };

        }



        if (

            obv > 0

        ) {

            score += 2;

            reasons.push(

                "Positive OBV"

            );

        }

        else if (

            obv < 0

        ) {

            score -= 2;

            reasons.push(

                "Negative OBV"

            );

        }



        /*
        ==================================================
        Volume Strength
        ==================================================
        */

        const strength =

            Math.abs(

                obv

            );



        if (

            strength > 1_000_000

        ) {

            score += 1;

            reasons.push(

                "Strong volume flow"

            );

        }

        else {

            reasons.push(

                "Weak volume flow"

            );

        }



        /*
        ==================================================
        Final Result
        ==================================================
        */

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
