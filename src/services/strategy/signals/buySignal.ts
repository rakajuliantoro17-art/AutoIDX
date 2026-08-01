/**
==========================================================
AURA Trade OS
BUY Signal Builder
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    ConfidenceLevel,

    MarketBias,

    RiskLevel,

    ScoreSignalResult,

} from "../types";



export interface BuySignalOptions {

    score: number;

    confidence: number;

    confidenceLevel: ConfidenceLevel;

    bias?: MarketBias;

    risk?: RiskLevel;

    reasons?: string[];

    timestamp?: number;

}



export class BuySignal {


    static create(

        options: BuySignalOptions

    ): ScoreSignalResult {


        return {

            signal: "BUY",

            bias:

                options.bias ??

                "BULLISH",

            confidence:

                Math.max(

                    0,

                    Math.min(

                        100,

                        options.confidence

                    )

                ),

            confidenceLevel:

                options.confidenceLevel,

            score:

                options.score,

            risk:

                options.risk ??

                "MEDIUM",

            reasons:

                options.reasons ??

                [],

            timestamp:

                options.timestamp ??

                Date.now(),

        };

    }

}
