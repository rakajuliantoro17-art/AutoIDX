/**
==========================================================
AURA Trade OS
Score Engine
Version : 0.1.1 Alpha
==========================================================
*/

import {

    BuySignal,

} from "../signals/buySignal";

import {

    SellSignal,

} from "../signals/sellSignal";

import {

    NeutralSignal,

} from "../signals/neutralSignal";


import type {

    RuleResult,

    StrategyDecision,

    RiskLevel,

    ConfidenceLevel,

} from "../types";



export interface ScoreEngineOptions {

    buyThreshold?: number;

    sellThreshold?: number;

}



export class ScoreEngine {


    private readonly buyThreshold:number;

    private readonly sellThreshold:number;



    constructor(

        options:ScoreEngineOptions = {}

    ) {

        this.buyThreshold =

            options.buyThreshold ?? 6;

        this.sellThreshold =

            options.sellThreshold ?? -6;

    }



    /**
     * Combine every rule
     * into one trading decision.
     */
    evaluate(

        results: readonly RuleResult[]

    ): StrategyDecision {


        const score =

            results.reduce(

                (

                    total,

                    rule

                ) =>

                    total + rule.score,

                0

            );



        const passedCount =

            results.filter(

                rule => rule.passed

            ).length;

        const confidenceScore =

            results.length === 0

                ? 0

                : Math.round(

                    (passedCount / results.length) * 100

                );

        const confidenceLevel:

            ConfidenceLevel =

            confidenceScore >= 85

                ? "VERY_HIGH"

                : confidenceScore >= 70

                    ? "HIGH"

                    : confidenceScore >= 50

                        ? "MEDIUM"

                        : confidenceScore >= 30

                            ? "LOW"

                            : "VERY_LOW";

        const confidence = {

            confidence: confidenceScore,

            level: confidenceLevel,

        };



        const reasons =

            results.map(

                rule => rule.reason

            );



        const risk =

            this.calculateRisk(

                confidence.confidence

            );



        if (

            score >=

            this.buyThreshold

        ) {

            return BuySignal.create({

                score,

                confidence:

                    confidence.confidence,

                confidenceLevel:

                    confidence.level,

                risk,

                reasons,

            });

        }



        if (

            score <=

            this.sellThreshold

        ) {

            return SellSignal.create({

                score,

                confidence:

                    confidence.confidence,

                confidenceLevel:

                    confidence.level,

                risk,

                reasons,

            });

        }



        return NeutralSignal.create({

            score,

            confidence:

                confidence.confidence,

            confidenceLevel:

                confidence.level,

            risk,

            reasons,

        });

    }



    /**
     * Estimate risk level.
     */
    private calculateRisk(

        confidence:number

    ):RiskLevel {


        if (

            confidence >= 80

        ) {

            return "LOW";

        }



        if (

            confidence >= 50

        ) {

            return "MEDIUM";

        }



        return "HIGH";

    }

}
