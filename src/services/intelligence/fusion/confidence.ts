/**
==========================================================
AURA Trade OS
Fusion Confidence Engine
Version : 0.1.0 Alpha
==========================================================
*/

export interface FusionConfidenceInput {

  scanner: number;

  strategy: number;

  ai: number;

  risk: number;

  market: number;

  portfolio: number;

}

export interface FusionConfidenceResult {

  total: number;

  grade: "A" | "B" | "C" | "D";

  stars: number;

  decision: "HIGH" | "MEDIUM" | "LOW";

  breakdown: {

    scanner: number;

    strategy: number;

    ai: number;

    risk: number;

    market: number;

    portfolio: number;

  };

}

export class FusionConfidenceEngine {

  calculate(

    input: FusionConfidenceInput

  ): FusionConfidenceResult {

    const total = Math.round(

      input.scanner * 0.25 +

      input.strategy * 0.25 +

      input.ai * 0.20 +

      input.market * 0.15 +

      input.risk * 0.10 +

      input.portfolio * 0.05

    );

    let grade: "A" | "B" | "C" | "D";

    let stars: number;

    let decision: "HIGH" | "MEDIUM" | "LOW";

    if (total >= 90) {

      grade = "A";

      stars = 5;

      decision = "HIGH";

    }

    else if (total >= 75) {

      grade = "B";

      stars = 4;

      decision = "HIGH";

    }

    else if (total >= 60) {

      grade = "C";

      stars = 3;

      decision = "MEDIUM";

    }

    else {

      grade = "D";

      stars = 2;

      decision = "LOW";

    }

    return {

      total,

      grade,

      stars,

      decision,

      breakdown: {

        scanner: input.scanner,

        strategy: input.strategy,

        ai: input.ai,

        risk: input.risk,

        market: input.market,

        portfolio: input.portfolio,

      },

    };

  }

}

const fusionConfidence =
  new FusionConfidenceEngine();

export default fusionConfidence;
