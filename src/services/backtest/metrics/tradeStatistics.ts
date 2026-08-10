/**
==========================================================
AURA Trade OS
Trade Statistics
Phase 34
==========================================================
*/

export interface CompletedTrade {
    readonly id: string;
    readonly symbol: string;
    readonly side: "LONG" | "SHORT";
    readonly entryPrice: number;
    readonly exitPrice: number;
    readonly quantity: number;
    readonly pnl: number;
    readonly returnPercent: number;
    readonly entryTime: number;
    readonly exitTime: number;
}

export interface TradeStatistics {
    readonly totalTrades: number;
    readonly winningTrades: number;
    readonly losingTrades: number;
    readonly winRate: number;
    readonly totalProfit: number;
    readonly totalLoss: number;
    readonly profitFactor: number;
    readonly averageTrade: number;
    readonly averageWin: number;
    readonly averageLoss: number;
    readonly largestWin: number;
    readonly largestLoss: number;
}

export function calculateTradeStatistics(
    trades: readonly CompletedTrade[],
): TradeStatistics {
    const winning =
        trades.filter(
            (trade) =>
                trade.pnl > 0,
        );

    const losing =
        trades.filter(
            (trade) =>
                trade.pnl < 0,
        );

    const totalProfit =
        winning.reduce(
            (sum, trade) =>
                sum + trade.pnl,
            0,
        );

    const totalLoss =
        Math.abs(
            losing.reduce(
                (sum, trade) =>
                    sum + trade.pnl,
                0,
            ),
        );

    const profitFactor =
        totalLoss === 0
            ? totalProfit > 0
                ? Number.POSITIVE_INFINITY
                : 0
            : totalProfit /
              totalLoss;

    return {
        totalTrades:
            trades.length,

        winningTrades:
            winning.length,

        losingTrades:
            losing.length,

        winRate:
            trades.length === 0
                ? 0
                : winning.length /
                  trades.length,

        totalProfit,

        totalLoss,

        profitFactor,

        averageTrade:
            trades.length === 0
                ? 0
                : trades.reduce(
                      (
                          sum,
                          trade,
                      ) =>
                          sum +
                          trade.pnl,
                      0,
                  ) /
                  trades.length,

        averageWin:
            winning.length === 0
                ? 0
                : totalProfit /
                  winning.length,

        averageLoss:
            losing.length === 0
                ? 0
                : -totalLoss /
                  losing.length,

        largestWin:
            winning.length === 0
                ? 0
                : Math.max(
                      ...winning.map(
                          (trade) =>
                              trade.pnl,
                      ),
                  ),

        largestLoss:
            losing.length === 0
                ? 0
                : Math.min(
                      ...losing.map(
                          (trade) =>
                              trade.pnl,
                      ),
                  ),
    };
}
