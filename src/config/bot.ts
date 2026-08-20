/**
==========================================================
AURA Trade OS
Bot Configuration
Version : 0.0.1 Alpha
==========================================================
*/


export type BotMode =

  | "paper"

  | "live";





export const BOT_CONFIG = {


  /**
   * Trading Mode
   */

  mode:

    (process.env.BOT_MODE as BotMode)

    ?? "paper",




  /**
   * Market Pair
   */

  defaultPair:

    process.env.BOT_PAIR

    ?? "BTC_IDR",






  /**
   * Capital Management
   *
   * PENTING: Indodax punya minimum order value Rp25.000
   * (terverifikasi dari help.indodax.com/hc/en-us/articles/
   * 4416646599705). Default SEBELUMNYA (Rp10.000) ada DI BAWAH
   * minimum itu -- kemungkinan besar penyebab order live selalu
   * gagal/ditolak Indodax walau semua gerbang internal (risk-gate,
   * saldo, dsb) sudah lolos. Jangan turunkan defaultTradeAmount di
   * bawah 25000 lewat env var BOT_DEFAULT_TRADE_AMOUNT.
   */

  defaultTradeAmount:

    Number(

      process.env.BOT_DEFAULT_TRADE_AMOUNT

      ?? 30000

    ),



  maxTradeAmount:

    Number(

      process.env.BOT_MAX_TRADE_AMOUNT

      ?? 50000

    ),



  /**
   * Saldo awal referensi untuk paper trading
   * (dipakai riskManager utk hitung maxExposurePercent/
   * maxDailyLossPercent, karena keduanya persentase dari saldo).
   */
  startingBalance:

    Number(

      process.env.BOT_STARTING_BALANCE

      ?? 1000000

    ),





  /**
   * Profit Management
   *
   * percentage
   */

  targetProfit:

    Number(

      process.env.BOT_TARGET_PROFIT

      ?? 3

    ),



  stopLoss:

    Number(

      process.env.BOT_STOP_LOSS

      ?? 1

    ),





  /**
   * Execution
   *
   * seconds
   */

  interval:

    Number(

      process.env.BOT_INTERVAL

      ?? 300

    ),





  /**
   * Risk Control
   */


  maxDailyLoss:

    Number(

      process.env.BOT_MAX_DAILY_LOSS

      ?? 5

    ),



  allowAutoTrade:

    process.env.BOT_AUTO_TRADE === "true"

};
