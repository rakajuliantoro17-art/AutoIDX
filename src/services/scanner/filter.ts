/**
==========================================================
AURA Trade OS
Market Scanner Filter Engine
Version : 0.0.1 Alpha
==========================================================
*/


import {

ScannedPairResult

}

from "./types";







export interface ScannerMetrics {


rsi:number;


emaFast:number;


emaSlow:number;


volumeIdr:number;


change24h:number;


}







/**
 * Calculate opportunity score
 *
 * Range:
 * 0 - 100
 */


export function calculateOpportunityScore(

metrics:ScannerMetrics

):number{



let score=50;






/**
 * RSI Momentum
 */


if(metrics.rsi <=25){

score+=25;

}

else if(metrics.rsi<=35){

score+=15;

}

else if(metrics.rsi>=75){

score-=25;

}

else if(metrics.rsi>=65){

score-=10;

}







/**
 * EMA Trend
 */


if(

metrics.emaFast >

metrics.emaSlow

){

score+=20;


}

else{


score-=15;


}







/**
 * Volume Liquidity
 */


if(

metrics.volumeIdr >= 5_000_000_000

){

score+=15;


}

else if(

metrics.volumeIdr >=1_000_000_000

){

score+=8;


}







/**
 * Daily Momentum
 */


if(

metrics.change24h > 0

&&

metrics.change24h < 5

){

score+=5;


}


if(

metrics.change24h < -10

){

score-=15;


}







return Math.min(

100,

Math.max(

0,

score

)

);


}










export function deriveSignalRecommendation(

score:number

):ScannedPairResult["signalRecommendation"]{


if(score>=85)

return "STRONG_BUY";



if(score>=70)

return "BUY";



if(score>=45)

return "WAIT";



if(score>=25)

return "AVOID";



return "SELL";


}










export function calculateConfidence(

score:number

):number{


return Number(

(score/100).toFixed(2)

);


}
