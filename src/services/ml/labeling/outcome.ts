/**
==========================================================
AURA Trade OS
ML Label Outcome Analyzer
Version : 0.1.0 Alpha
==========================================================
*/


import {

 PredictionLabel

} from "../types";



export type OutcomeStatus =

  | "WIN"

  | "LOSS"

  | "BREAKEVEN";



export interface TradeOutcome {


  label:PredictionLabel;


  status:OutcomeStatus;


  return:number;


  maxProfit:number;


  maxDrawdown:number;


}





export interface OutcomeConfig {


  winThreshold:number;


  lossThreshold:number;


}





export class OutcomeAnalyzer {



  /**
   * Evaluate Trade Result
   */


  evaluate(

    label:PredictionLabel,

    entry:number,

    candles:{

      high:number;

      low:number;

      close:number;

    }[],

    config:OutcomeConfig

  ):TradeOutcome {



    let maxProfit = 0;


    let maxDrawdown = 0;



    const final =

      candles[

        candles.length - 1

      ];





    for(

      const candle of candles

    ){


      const profit =

      (

        candle.high-entry

      )

      /

      entry;





      const drawdown =

      (

        candle.low-entry

      )

      /

      entry;





      maxProfit =

      Math.max(

        maxProfit,

        profit

      );





      maxDrawdown =

      Math.min(

        maxDrawdown,

        drawdown

      );


    }





    const result =

    (

      final.close-entry

    )

    /

    entry;





    let status:OutcomeStatus;





    if(

      result >=

      config.winThreshold

    ){


      status="WIN";


    }

    else if(

      result <=

      config.lossThreshold

    ){


      status="LOSS";


    }

    else {


      status="BREAKEVEN";


    }





    return {


      label,


      status,


      return:result,


      maxProfit,


      maxDrawdown


    };


  }





}





const outcomeAnalyzer =

new OutcomeAnalyzer();



export default outcomeAnalyzer;
