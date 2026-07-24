/**
==========================================================
Risk Management Configuration
==========================================================
*/

export const RISK_CONFIG = {

  stopLossPercent:
    Number(process.env.BOT_STOP_LOSS ?? 1),

  targetProfitPercent:
    Number(process.env.BOT_TARGET_PROFIT ?? 3),

  maxOpenPosition:
    Number(process.env.BOT_MAX_OPEN_POSITION ?? 3),

};
