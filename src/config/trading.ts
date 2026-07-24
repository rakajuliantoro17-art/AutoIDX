/**
==========================================================
AURA Trade OS
Trading Configuration
Version : 0.0.1 Alpha
==========================================================
*/


export type TradingMode =

  | "paper"

  | "live";





export const TRADING_CONFIG = {


  /**
   * Market Pair
   */

  pair:

    process.env.BOT_PAIR

    ?? "btc_idr",






  /**
   * Trading Capital
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
   * Execution Interval
   *
   * seconds
   */

  interval:

    Number(

      process.env.BOT_INTERVAL

      ?? 300

    ),






  /**
   * Trading Mode
   */

  mode:

    (

      process.env.BOT_MODE

      as TradingMode

    )

    ?? "paper",






  /**
   * Order Settings
   */


  order:{


    type:

      process.env.ORDER_TYPE

      ?? "limit",



    minimumAmount:

      Number(

        process.env.MIN_ORDER_AMOUNT

        ?? 10000

      ),


  },






  /**
   * Exchange Fee Estimation
   */

  feePercent:

    Number(

      process.env.EXCHANGE_FEE

      ?? 0.3

    )



} as const;
