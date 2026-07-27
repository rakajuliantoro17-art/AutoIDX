/**
==========================================================
AURA Trade OS
Decision Fusion Engine
Version : 0.1.0 Alpha
==========================================================
*/

import {
  FusionConfidenceResult,
} from "./confidence";

export type TradingDecision =

  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface DecisionFusionInput {

  scannerSignal:
    TradingDecision;

  strategySignal:
    TradingDecision;

  aiSignal:
    TradingDecision;

  riskApproved:
    boolean;

  portfolioApproved:
    boolean;

  marketApproved:
    boolean;

  confidence:
    FusionConfidenceResult;

}

export interface DecisionFusionResult {

  decision:
    TradingDecision;

  confidence:
    number;

  approved:
    boolean;

  reasons:
    string[];

}

export class DecisionFusionEngine {

  evaluate(

    input: DecisionFusionInput

  ): DecisionFusionResult {

    const votes = {

      STRONG_BUY: 0,

      BUY: 0,

      HOLD: 0,

      SELL: 0,

      STRONG_SELL: 0,

    };

    votes[input.scannerSignal]++;

    votes[input.strategySignal]++;

    votes[input.aiSignal]++;

    /**
     * Voting Winner
     */

    const decision =

      Object.entries(votes)

      .sort(

        (a, b) =>

          b[1] - a[1]

      )[0][0]

      as TradingDecision;

    const reasons: string[] = [];

    let approved = true;

    if (!input.riskApproved) {

      approved = false;

      reasons.push(

        "Risk engine rejected."

      );

    }

    if (!input.portfolioApproved) {

      approved = false;

      reasons.push(

        "Portfolio exposure too high."

      );

    }

    if (!input.marketApproved) {

      approved = false;

      reasons.push(

        "Market condition unsuitable."

      );

    }

    if (

      input.confidence.total < 70

    ) {

      approved = false;

      reasons.push(

        "Fusion confidence too low."

      );

    }

    if (

      reasons.length === 0

    ) {

      reasons.push(

        "All validation passed."

      );

    }

    return {

      decision,

      confidence:

      input.confidence.total,

      approved,

      reasons,

    };

  }

}

const fusionDecision =

new DecisionFusionEngine();

export default fusionDecision;
