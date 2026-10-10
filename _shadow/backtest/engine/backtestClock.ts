/**
==========================================================
AURA Trade OS
Backtest Clock
Phase 34
==========================================================
*/

export class BacktestClock {
    private timestamp = 0;

    public set(
        timestamp: number,
    ): void {
        if (
            !Number.isFinite(
                timestamp,
            )
        ) {
            throw new Error(
                "Invalid backtest timestamp",
            );
        }

        if (
            timestamp < this.timestamp
        ) {
            throw new Error(
                "Backtest clock cannot move backwards",
            );
        }

        this.timestamp =
            timestamp;
    }

    public now(): number {
        return this.timestamp;
    }

    public reset(): void {
        this.timestamp = 0;
    }
}
