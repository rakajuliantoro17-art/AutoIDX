/**
==========================================================
AURA Trade OS
ML Labeling Rules Configuration
Version : 0.1.0 Alpha
==========================================================
*/


export type MarketRegime =

  | "TRENDING"

  | "SIDEWAYS"

  | "VOLATILE";



export interface LabelRule {


  symbol:string;


  timeframe:string;


  strategy:string;



  buyThreshold:number;


  sellThreshold:number;



  takeProfit:number;


  stopLoss:number;



  maxHoldingCandles:number;



  regime:MarketRegime;


}





export class LabelRuleManager {



  private rules:LabelRule[] = [



    {
      symbol:"BTCUSDT",

      timeframe:"15m",

      strategy:"TREND",

      buyThreshold:0.03,

      sellThreshold:-0.03,

      takeProfit:0.05,

      stopLoss:0.02,

      maxHoldingCandles:20,

      regime:"TRENDING"

    },



    {
      symbol:"ETHUSDT",

      timeframe:"15m",

      strategy:"TREND",

      buyThreshold:0.025,

      sellThreshold:-0.025,

      takeProfit:0.04,

      stopLoss:0.02,

      maxHoldingCandles:20,

      regime:"TRENDING"

    },



    {
      symbol:"DEFAULT",

      timeframe:"1h",

      strategy:"TRIPLE_BARRIER",

      buyThreshold:0.03,

      sellThreshold:-0.03,

      takeProfit:0.05,

      stopLoss:0.03,

      maxHoldingCandles:50,

      regime:"VOLATILE"

    }


  ];





  /**
   * Get Rule
   */


  getRule(

    symbol:string,

    timeframe:string

  ):LabelRule {



    const exact =

      this.rules.find(

        rule =>

        rule.symbol===symbol

        &&

        rule.timeframe===timeframe

      );





    if(exact){

      return exact;

    }





    const fallback =

      this.rules.find(

        rule =>

        rule.symbol==="DEFAULT"

      );





    return fallback!;


  }





  /**
   * Add Custom Rule
   */


  addRule(

    rule:LabelRule

  ){


    this.rules.push(

      rule

    );


  }





  /**
   * List Rules
   */


  getAll(){

    return this.rules;

  }



}





const labelRuleManager =

new LabelRuleManager();



export default labelRuleManager;
