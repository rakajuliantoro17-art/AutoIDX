/**
==========================================================
AURA Trade OS
Backtest Slippage Model
Phase 34
==========================================================
*/

export type SlippageSide =
    | "BUY"
    | "SELL";

export interface SlippageModel {
    apply(
        price: number,
        side: SlippageSide,
    ): number;
}

export class PercentageSlippageModel
    implements SlippageModel {
    private readonly rate: number;

    constructor(rate: number) {
        if (
            !Number.isFinite(rate) ||
            rate < 0
        ) {
            throw new Error(
                "Slippage rate must be a non-negative finite number",
            );
        }

        this.rate = rate;
    }

    public apply(
        price: number,
        side: SlippageSide,
    ): number {
        if (side === "BUY") {
            return (
                price *
                (1 + this.rate)
            );
        }

        return (
            price *
            (1 - this.rate)
        );
    }

    public getRate(): number {
        return this.rate;
    }
}

export class NoSlippageModel
    implements SlippageModel {
    public apply(
        price: number,
        _side: SlippageSide,
    ): number {
        return price;
    }
}
