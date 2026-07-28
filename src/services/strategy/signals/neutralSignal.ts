/**
==========================================================
AURA Trade OS
HOLD Signal Builder
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    ConfidenceLevel,

    MarketBias,

    RiskLevel,

    StrategyDecision,

} from "../types";



export interface NeutralSignalOptions {

    score: number;

    confidence: number;

    confidenceLevel: ConfidenceLevel;

    bias?: MarketBias;

    risk?: RiskLevel;

    reasons?: string[];

    timestamp?: number;

}



export class NeutralSignal {


    static create(

        options: NeutralSignalOptions

    ): StrategyDecision {


        return {

            signal: "HOLD",

            bias:

                options.bias ??

                "SIDEWAYS",

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

                [

                    "No strong trading confirmation."

                ],

            timestamp:

                options.timestamp ??

                Date.now(),

        };

    }

}
