/**
==========================================================
AURA Trade OS
Technical Indicator Configuration
Version : 0.0.1 Alpha
==========================================================
*/


export const INDICATORS = {


  /**
   * EMA Configuration
   */

  EMA: {

    FAST:

      Number(

        process.env.EMA_FAST

        ?? 9

      ),


    SLOW:

      Number(

        process.env.EMA_SLOW

        ?? 21

      ),

  },




  /**
   * RSI Configuration
   */

  RSI: {


    PERIOD:

      Number(

        process.env.RSI_PERIOD

        ?? 14

      ),



    OVERSOLD:

      Number(

        process.env.RSI_OVERSOLD

        ?? 30

      ),



    OVERBOUGHT:

      Number(

        process.env.RSI_OVERBOUGHT

        ?? 70

      ),


  },




  /**
   * Future Indicators
   */

  MACD: {


    ENABLED:false,


    FAST:12,


    SLOW:26,


    SIGNAL:9,


  },



  BOLLINGER: {


    ENABLED:false,


    PERIOD:20,


    STD_DEV:2,


  },



  ATR:{


    ENABLED:false,


    PERIOD:14,


  }


};
