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

}
