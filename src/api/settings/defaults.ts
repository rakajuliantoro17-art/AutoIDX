import { BotSettings } from "./types";

export const DEFAULT_SETTINGS: BotSettings = {

    version: "0.0.1",

    mode: "paper",

    enabled: true,

    tradeAmountIdr: 10000,

    targetProfitPercent: 3,

    stopLossPercent: 2,

    maxOpenPositions: 1,

    scanIntervalMinutes: 5,

    pairs: [

        "btcidr",

        "ethidr",

        "solidr"

    ],

    strategyMode: "BALANCED"

};
