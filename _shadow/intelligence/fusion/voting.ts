/**
==========================================================
AURA Trade OS
Fusion Voting Engine
Version : 0.1.0 Alpha
==========================================================
*/

export type VoteSignal =

  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface Vote {

  source: string;

  signal: VoteSignal;

  weight: number;

  confidence: number;

}

export interface VotingResult {

  winner: VoteSignal;

  score: number;

  consensus: number;

  breakdown: Record<VoteSignal, number>;

}

export class VotingEngine {

  /**
   * Weighted Voting
   */
  evaluate(
    votes: Vote[]
  ): VotingResult {

    const breakdown: Record<VoteSignal, number> = {

      STRONG_BUY: 0,

      BUY: 0,

      HOLD: 0,

      SELL: 0,

      STRONG_SELL: 0,

    };

    let totalWeight = 0;

    for (const vote of votes) {

      const weightedScore =

        vote.weight *

        (vote.confidence / 100);

      breakdown[vote.signal] += weightedScore;

      totalWeight += weightedScore;

    }

    const sorted =

      Object.entries(breakdown)

      .sort(

        (a, b) =>

          b[1] - a[1]

      );

    const winner =

      sorted[0][0] as VoteSignal;

    const score =

      sorted[0][1];

    const consensus =

      totalWeight === 0

        ? 0

        : Math.round(

            (score / totalWeight) * 100

          );

    return {

      winner,

      score,

      consensus,

      breakdown,

    };

  }

}

const votingEngine =
  new VotingEngine();

export default votingEngine;
