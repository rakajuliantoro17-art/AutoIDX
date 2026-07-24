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
   */


  defaultTradeAmount:

    Number(

      process.env.BOT_DEFAULT_TRADE_AMOUNT

      ?? 10000

    ),



  maxTradeAmount:

    Number(

      process.env.BOT_MAX_TRADE_AMOUNT

      ?? 25000

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

