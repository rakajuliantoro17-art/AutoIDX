/**
==========================================================
AURA Trade OS
ML Labeling Engine
Version : 0.1.0 Alpha
==========================================================
*/


import {

 PredictionLabel

} from "../types";



export interface Candle {


 timestamp:number;


 open:number;


 high:number;


 low:number;


 close:number;


 volume:number;


}




export interface LabelConfig {


 futureCandles:number;


 buyThreshold:number;


 sellThreshold:number;


}





export interface LabelResult {


 label:PredictionLabel;


 futureReturn:number;


}





export class LabelingEngine {



 /**
  * Generate Label
  */


 generate(

  current:Candle,

  future:Candle[],

  config:LabelConfig

 ):LabelResult {



  const target =

    future[

      Math.min(

        config.futureCandles,

        future.length

      ) - 1

    ];





  if(!target){


    return {


      label:"HOLD",

      futureReturn:0


    };


  }





  const futureReturn =


    (

      target.close -

      current.close

    )

    /

    current.close;





  let label:

    PredictionLabel;





  if(

    futureReturn >=

    config.buyThreshold

  ){



    label="BUY";


  }

  else if(

    futureReturn <=

    config.sellThreshold

  ){



    label="SELL";


  }

  else {



    label="HOLD";


  }





  return {


    label,


    futureReturn


  };



 }





 /**
  * Batch Labeling
  */


 batch(

  candles:Candle[],

  config:LabelConfig

 ){



  const result:

    LabelResult[]=[];





  for(

    let i=0;

    i<candles.length;

    i++

  ){



    const future =

      candles.slice(

        i+1

      );





    result.push(

      this.generate(

        candles[i],

        future,

        config

      )

    );


  }





  return result;


 }



}





const labelingEngine =

new LabelingEngine();



export default labelingEngine;
