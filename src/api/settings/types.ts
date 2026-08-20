export interface BotSettings {

    version: string;

    mode: "paper" | "live";

    enabled: boolean;

    tradeAmountIdr: number;

    targetProfitPercent: number;

    stopLossPercent: number;

    maxOpenPositions: number;

    scanIntervalMinutes: number;

    pairs: string[];

    /**
     * Mode strategi (services/strategy/manager.ts, StrategyMode).
     * CONSERVATIVE -> EMA_CROSSOVER, BALANCED -> AURA_TREND (default),
     * AGGRESSIVE -> MOMENTUM. Opsional untuk backward-compat dengan
     * dokumen Firestore lama yang belum punya field ini -- lihat
     * fallback di getEffectiveTradingConfig().
     */
    strategyMode?: "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";

}
