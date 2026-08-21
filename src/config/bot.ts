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
   * FASE UJI COBA AWAL: defaultTradeAmount DAN maxTradeAmount
   * sengaja dikunci SAMA (Rp10.000) -- supaya nominal trade tetap
   * konsisten selagi memvalidasi BUY live benar-benar tereksekusi
   * beberapa siklus. Setelah terbukti jalan, lebarkan
   * maxTradeAmount ke Rp500.000 (dan sesuaikan slider di
   * pages/settings/risk.tsx, TRADE_AMOUNT_MAX).
   *
   * Minimum transaksi Indodax adalah Rp10.000. Catatan dari
   * help.indodax.com: transaksi Rp10.000-Rp24.999 diproses lewat
   * "Indodax Lite", sedangkan >=Rp25.000 langsung lewat "Indodax
   * Pro" -- keduanya SAMA-SAMA valid/diproses, cuma beda jalur
   * internal.
   */

  defaultTradeAmount:

    Number(

      process.env.BOT_DEFAULT_TRADE_AMOUNT

      ?? 10000

    ),



  maxTradeAmount:

    Number(

      process.env.BOT_MAX_TRADE_AMOUNT

      ?? 10000

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
