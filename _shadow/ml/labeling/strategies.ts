/**
==========================================================
AURA Trade OS
ML Labeling Strategies
Version : 0.1.0 Alpha
==========================================================
*/


import {

 PredictionLabel

} from "../types";



export interface MarketSnapshot {


 price:number;


 emaFast:number;


 emaSlow:number;


 macd:number;


 rsi:number;


 adx:number;


 volume:number;


}



export interface LabelStrategy {


 name:string;


 evaluate(

  data:MarketSnapshot

 ):PredictionLabel;


}




/**
==========================================================
Return Strategy
==========================================================
*/


export class ReturnStrategy

implements LabelStrategy {


 name="RETURN";



 constructor(

  private threshold:number = 0.03

 ){}



 evaluate(

  data:any

 ):PredictionLabel {


  const futureReturn =

  data.futureReturn;



  if(

   futureReturn >=

   this.threshold

  ){

   return "BUY";

  }



  if(

   futureReturn <=

   -this.threshold

  ){

   return "SELL";

  }



  return "HOLD";


 }



}





/**
==========================================================
Trend Following Strategy
==========================================================
*/


export class TrendStrategy

implements LabelStrategy {


 name="TREND";



 evaluate(

  data:MarketSnapshot

 ):PredictionLabel {



  if(

   data.emaFast >

   data.emaSlow

   &&

   data.macd > 0

   &&

   data.adx >=25

  ){

   return "BUY";

  }





  if(

   data.emaFast <

   data.emaSlow

   &&

   data.macd <0

   &&

   data.adx >=25

  ){

   return "SELL";

  }





  return "HOLD";


 }



}





/**
==========================================================
Mean Reversion Strategy
==========================================================
*/


export class MeanReversionStrategy

implements LabelStrategy {


 name="MEAN_REVERSION";



 evaluate(

  data:MarketSnapshot

 ):PredictionLabel {



  if(

   data.rsi <=30

  ){

   return "BUY";

  }





  if(

   data.rsi >=70

  ){

   return "SELL";

  }





  return "HOLD";


 }



}





/**
==========================================================
Breakout Strategy
==========================================================
*/


export class BreakoutStrategy

implements LabelStrategy {


 name="BREAKOUT";



 evaluate(

  data:MarketSnapshot

 ):PredictionLabel {



  if(

   data.volume >

   1.5

   &&

   data.adx >30

   &&

   data.macd >0

  ){

   return "BUY";

  }





  return "HOLD";


 }



}





/**
==========================================================
Triple Barrier Strategy
==========================================================
*/


export class TripleBarrierStrategy

implements LabelStrategy {



 name="TRIPLE_BARRIER";



 evaluate(

  data:any

 ):PredictionLabel {



  const profit =

  data.futureHigh -

  data.entryPrice;



  const loss =

  data.entryPrice -

  data.futureLow;





  if(

   profit /

   data.entryPrice

   >=

   data.takeProfit

  ){

   return "BUY";

  }





  if(

   loss /

   data.entryPrice

   >=

   data.stopLoss

  ){

   return "SELL";

  }





  return "HOLD";


 }



}





export const labelingStrategies = {


 return:

 new ReturnStrategy(),


 trend:

 new TrendStrategy(),


 meanReversion:

 new MeanReversionStrategy(),


 breakout:

 new BreakoutStrategy(),


 tripleBarrier:

 new TripleBarrierStrategy()


};
