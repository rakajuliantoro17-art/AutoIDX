/**
==========================================================
AURA Trade OS
Confidence Engine
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    ConfidenceLevel,
    RuleResult,

} from "../types";



export interface ConfidenceResult {

    confidence: number;

    level: ConfidenceLevel;

    agreement: number;

    activeRules: number;

}



export class ConfidenceEngine {


    /**
     * Calculate confidence from rule results.
     */
    static calculate(

        results: readonly RuleResult[]

    ): ConfidenceResult {


        if (

            results.length === 0

        ) {

            return {

                confidence: 0,

                level: "VERY_LOW",

                agreement: 0,

                activeRules: 0,

            };

        }



        const activeRules =

            results.length;



        const positiveRules =

            results.filter(

                rule => rule.passed

            ).length;



        const agreement =

            (

                positiveRules /

                activeRules

            )

            * 100;



        const totalScore =

            results.reduce(

                (

                    total,

                    rule

                ) =>

                    total + rule.score,

                0

            );



        const maxScore =

            activeRules * 5;



        const confidence =

            Math.max(

                0,

                Math.min(

                    100,

                    (

                        Math.abs(

                            totalScore

                        )

                        /

                        maxScore

                    )

                    * 100

                )

            );



        return {

            confidence,

            level:

                this.toLevel(

                    confidence

                ),

            agreement,

            activeRules,

        };

    }



    /**
     * Convert percentage
     * to confidence level.
     */
    private static toLevel(

        confidence: number

    ): ConfidenceLevel {


        if (

            confidence >= 90

        ) {

            return "VERY_HIGH";

        }



        if (

            confidence >= 75

        ) {

            return "HIGH";

        }



        if (

            confidence >= 50

        ) {

            return "MEDIUM";

        }



        if (

            confidence >= 25

        ) {

            return "LOW";

        }



        return "VERY_LOW";

    }

}
