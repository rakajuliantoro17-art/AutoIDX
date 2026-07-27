/**
==========================================================
AURA Trade OS
AI Market Sentiment Analyzer
Version : 0.0.1 Alpha
==========================================================
*/


import {
queryAIModel
} from "./client";


import {
MARKET_ANALYSIS_PROMPT
} from "./promptTemplates";





export interface AIAnalysisResult {


validation:

"CONFIRM"

|

"WARNING"

|

"REJECT";



decision:

"BUY"

|

"SELL"

|

"HOLD";



confidence:number;



riskLevel:

"LOW"

|

"MEDIUM"

|

"HIGH";



reason:string;



suggestedStopLoss:number;



suggestedTakeProfit:number;


}







export interface MarketMetrics {


pair:string;


price:number;


rsi:number;


emaFast:number;


emaSlow:number;


strategySignal?:

"BUY"

|

"SELL"

|

"HOLD";



position?:

string;



}








function buildPrompt(

metrics:MarketMetrics

){



const trendCondition =

metrics.emaFast >

metrics.emaSlow

?

"Bullish"

:

"Bearish";





return MARKET_ANALYSIS_PROMPT


.replace(

"{{pair}}",

metrics.pair.toUpperCase()

)


.replace(

"{{price}}",

metrics.price.toLocaleString("id-ID")

)


.replace(

"{{rsi}}",

metrics.rsi.toString()

)


.replace(

"{{emaFast}}",

metrics.emaFast.toString()

)


.replace(

"{{emaSlow}}",

metrics.emaSlow.toString()

)


.replace(

"{{trendCondition}}",

trendCondition

)


.replace(

"{{strategySignal}}",

metrics.strategySignal ?? "HOLD"

)


.replace(

"{{position}}",

metrics.position ?? "NONE"

)


.replace(

"{{stopLoss}}",

"1"

)


.replace(

"{{takeProfit}}",

"3"

);



}








export async function analyzeMarketWithAI(

metrics:MarketMetrics

):Promise<AIAnalysisResult>{



const prompt=

buildPrompt(metrics);





const response=

await queryAIModel(prompt);






if(

!response.success

||

!response.content

){



return fallbackAnalysis(metrics);


}







try{



const cleaned =

response.content

.replace(

/```json|```/g,

""

)

.trim();






return JSON.parse(cleaned);



}

catch(error){



console.error(

"[AI JSON ERROR]",

error

);



return {


validation:"WARNING",


decision:"HOLD",


confidence:0,


riskLevel:"HIGH",


reason:

"AI response invalid format.",


suggestedStopLoss:2,


suggestedTakeProfit:4


};



}



}









function fallbackAnalysis(

metrics:MarketMetrics

):AIAnalysisResult{



if(metrics.rsi < 30){



return {


validation:"WARNING",


decision:"BUY",


confidence:.5,


riskLevel:"MEDIUM",


reason:

"RSI oversold fallback.",


suggestedStopLoss:2,


suggestedTakeProfit:4


};



}






if(metrics.rsi > 70){



return {


validation:"WARNING",


decision:"SELL",


confidence:.5,


riskLevel:"MEDIUM",


reason:

"RSI overbought fallback.",


suggestedStopLoss:2,


suggestedTakeProfit:4


};



}






return {


validation:"WARNING",


decision:"HOLD",


confidence:.5,


riskLevel:"LOW",


reason:

"AI unavailable, market neutral.",


suggestedStopLoss:2,


suggestedTakeProfit:4


};



}
