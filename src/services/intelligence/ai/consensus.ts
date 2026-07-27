/**
==========================================================
AURA Trade OS
AI Consensus Engine
Version : 0.1.0 Alpha
==========================================================
*/

export type AIProvider =

  | "openai"
  | "gemini"
  | "claude"
  | "deepseek"
  | "local";

export type AISignal =

  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface AIConsensusInput {

  provider: AIProvider;

  signal: AISignal;

  confidence: number;

  weight: number;

  explanation?: string;

}

export interface AIConsensusResult {

  signal: AISignal;

  confidence: number;

  agreement: number;

  providers: AIProvider[];

  explanation: string;

}

export class AIConsensusEngine {

  evaluate(

    analyses: AIConsensusInput[]

  ): AIConsensusResult {

    const scores = {

      STRONG_BUY: 0,

      BUY: 0,

      HOLD: 0,

      SELL: 0,

      STRONG_SELL: 0,

    };

    let totalWeight = 0;

    for (const ai of analyses) {

      const score =

        ai.weight *

        (ai.confidence / 100);

      scores[ai.signal] += score;

      totalWeight += score;

    }

    const winner =

      Object.entries(scores)

      .sort(

        (a, b) =>

          b[1] - a[1]

      )[0];

    const agreement =

      totalWeight === 0

        ? 0

        : Math.round(

            (winner[1] / totalWeight) *

            100

          );

    return {

      signal:

        winner[0] as AISignal,

      confidence:

        agreement,

      agreement,

      providers:

        analyses.map(

          a => a.provider

        ),

      explanation:

        `${winner[0]} selected by AI consensus (${agreement}%).`

    };

  }

}

const aiConsensus =

new AIConsensusEngine();

export default aiConsensus;
