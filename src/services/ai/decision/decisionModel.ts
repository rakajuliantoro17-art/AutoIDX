/**
==========================================================
AURA Trade OS
Decision Model
Phase 30
==========================================================
*/

import type {
    DecisionInput,
} from "./decisionInput";

import type {
    DecisionOutput,
} from "./decisionOutput";

export interface DecisionModel {
    readonly id: string;

    readonly version: string;

    decide(
        input: DecisionInput,
    ): DecisionOutput;
}

export class BasicDecisionModel
    implements DecisionModel {
    public readonly id =
        "basic-decision";

    public readonly version =
        "1.0.0";

    public decide(
        input: DecisionInput,
    ): DecisionOutput {
        const {
            prediction,
            riskScore,
        } = input;

        const confidence =
            prediction.confidence;

        let action:
            | "BUY"
            | "SELL"
            | "HOLD";

        if (
            riskScore > 0.75
        ) {
            action = "HOLD";
        } else if (
            prediction.direction ===
                "BULLISH" &&
            confidence >= 0.5
        ) {
            action = "BUY";
        } else if (
            prediction.direction ===
                "BEARISH" &&
            confidence >= 0.5
        ) {
            action = "SELL";
        } else {
            action = "HOLD";
        }

        return {
            modelId: this.id,
            modelVersion:
                this.version,
            action,
            confidence,
            riskScore,
            reason:
                createDecisionReason(
                    action,
                    prediction.direction,
                    riskScore,
                ),
            generatedAt:
                Date.now(),
            metadata: {
                symbol:
                    input.symbol,
            },
        };
    }
}

function createDecisionReason(
    action:
        | "BUY"
        | "SELL"
        | "HOLD",
    direction: string,
    riskScore: number,
): string {
    if (
        riskScore > 0.75
    ) {
        return "Risk score is too high";
    }

    if (action === "BUY") {
        return `Prediction is ${direction}`;
    }

    if (action === "SELL") {
        return `Prediction is ${direction}`;
    }

    return "No sufficiently strong trading signal";
}

export default BasicDecisionModel;
