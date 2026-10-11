/**
==========================================================
AURA Trade OS
Decision Output
Phase 30
==========================================================
*/

export type TradingDecision =
    | "BUY"
    | "SELL"
    | "HOLD";

export interface DecisionOutput {
    readonly modelId: string;

    readonly modelVersion: string;

    readonly action:
        TradingDecision;

    readonly confidence: number;

    readonly riskScore: number;

    readonly reason: string;

    readonly generatedAt: number;

    readonly metadata:
        Record<string, unknown>;
}

export function isActionableDecision(
    output: DecisionOutput,
): boolean {
    return (
        output.action === "BUY" ||
        output.action === "SELL"
    );
}
