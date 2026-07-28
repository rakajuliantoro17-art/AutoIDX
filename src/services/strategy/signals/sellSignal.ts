/**
==========================================================
AURA Trade OS
SELL Signal Builder
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    ConfidenceLevel,

    MarketBias,

    RiskLevel,

    StrategyDecision,

} from "../types";



export interface SellSignalOptions {

    score: number;

    confidence: number;

    confidenceLevel: ConfidenceLevel;

    bias?: MarketBias;

    risk?: RiskLevel;

    reasons?: string[];

    timestamp?: number;

}



export class SellSignal {


    static create(

        options: SellSignalOptions

    ): StrategyDecision {


        return {

            signal: "SELL",

            bias:

                options.bias ??

                "BEARISH",

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
