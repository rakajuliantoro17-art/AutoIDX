/**
==========================================================
AURA Trade OS
Risk Management Configuration
Version : 0.0.2 Alpha
==========================================================
UPDATE (integrasi config/limits.ts): maxExposurePercent dan
maxDailyLossPercent sekarang di-clamp ke MAX_EXPOSURE_PERCENT /
MAX_DAILY_LOSS_PERCENT dari config/limits.ts -- batas keamanan
MUTLAK yang cuma bisa berubah lewat edit kode + redeploy, bukan
cuma env var Vercel. TIDAK mengubah perilaku saat ini (default
env var: maxExposurePercent 20% & maxDailyLossPercent 5%, sama-
sama di bawah ceiling limits.ts 50% & 5%) -- murni jaring
pengaman kalau env var di Vercel ke-set ke angka yang salah.
==========================================================
*/

import {
  MAX_EXPOSURE_PERCENT as ABSOLUTE_MAX_EXPOSURE_PERCENT,
  MAX_DAILY_LOSS_PERCENT as ABSOLUTE_MAX_DAILY_LOSS_PERCENT,
} from "./limits";

function clampToAbsoluteCeiling(value: number, ceiling: number): number {
  if (!Number.isFinite(value)) return ceiling;
  return Math.min(value, ceiling);
}


export const RISK_CONFIG = {


  /**
   * Stop Loss
   *
   * Percentage (%)
   */

  stopLossPercent:

    Number(

      process.env.BOT_STOP_LOSS

      ?? 1

    ),


  /**
   * Position sizing mode.
   * FIXED       = pakai tradeAmountIdr tetap (perilaku default/lama).
   * RISK_BASED  = ukuran posisi dihitung dari riskPercentPerTrade
   *               dan jarak stopLossPercent (execution/risk/positionSizing.ts,
   *               sebelumnya orphan). OFF secara default -- tidak
   *               mengubah perilaku live yang sudah berjalan tanpa
   *               persetujuan eksplisit lewat env var.
   */
  sizingMode:
    (process.env.BOT_SIZING_MODE === "RISK_BASED"
      ? "RISK_BASED"
      : "FIXED") as "FIXED" | "RISK_BASED",

  /**
   * Persentase saldo yang boleh dipertaruhkan per trade, HANYA
   * dipakai kalau sizingMode === "RISK_BASED".
   */
  riskPercentPerTrade:
    Number(
      process.env.BOT_RISK_PERCENT_PER_TRADE
      ?? 1
    ),





  /**
   * Take Profit
   */

  targetProfitPercent:

    Number(

      process.env.BOT_TARGET_PROFIT

      ?? 3

    ),





  /**
   * Maximum Active Position
   */

  maxOpenPosition:

    Number(

      process.env.BOT_MAX_OPEN_POSITION

      ?? 3

    ),





  /**
   * Capital Exposure
   *
   * Maximum percentage of balance
   * used per trade
   */

  maxExposurePercent:

    clampToAbsoluteCeiling(

      Number(

        process.env.BOT_MAX_EXPOSURE

        ?? 20

      ),

      ABSOLUTE_MAX_EXPOSURE_PERCENT

    ),





  /**
   * Daily Risk Control
   */

  maxDailyLossPercent:

    clampToAbsoluteCeiling(

      Number(

        process.env.BOT_MAX_DAILY_LOSS

        ?? 5

      ),

      ABSOLUTE_MAX_DAILY_LOSS_PERCENT

    ),





  /**
   * Trailing Stop
   */

  trailingStop:{


    enabled:

      process.env.TRAILING_STOP_ENABLED === "true",


    percent:

      Number(

        process.env.TRAILING_STOP_PERCENT

        ?? 1.5

      )

  },





  /**
   * Emergency Protection
   */

  emergencyStop:


    process.env.BOT_EMERGENCY_STOP === "true",




  /**
   * Trading Cooldown
   *
   * prevent over trading
   */

  cooldownSeconds:

    Number(

      process.env.BOT_COOLDOWN

      ?? 300

    )


};
