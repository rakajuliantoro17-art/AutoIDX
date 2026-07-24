/**
==========================================================
AURA Trade OS
Market Scanner Engine
Version : 0.0.1 Alpha
==========================================================
*/


import indodaxTickerService from "../indodax/ticker";

import indodaxMarketService from "../indodax/market";

import {
analyzeTechnicalIndicators
}
from "../indicators";


import {

calculateOpportunityScore,

deriveSignalRecommendation,

calculateConfidence

}
from "./filter";


import {

ScanCriteria,

ScannedPairResult,

MarketScanSummary

}
from "./types";






export class MarketScanner {


private defaultPairs=[

"btc_idr",

"eth_idr",

"sol_idr",

"ada_idr",

"xrp_idr"

];







async scanMarket(

pairsToScan=this.defaultPairs,

criteria:Partial<ScanCriteria>={}

):Promise<MarketScanSummary>{



const minVolume=

criteria.minVolumeIdr ?? 50_000_000;



const qualified:ScannedPairResult[]=[];







const tasks=

pairsToScan.map(async pair=>{


try{


const ticker=

await indodaxTickerService
.getFormattedTicker(pair);



if(

!ticker ||

ticker.volIdr < minVolume

)

return null;







const prices=

await indodaxMarketService
.getPriceSeries(pair,50);



if(prices.length<25)

return null;







const tech=

analyzeTechnicalIndicators(prices);







const score=

calculateOpportunityScore({

rsi:tech.rsi14,

emaFast:tech.emaFast,

emaSlow:tech.emaSlow,

volumeIdr:ticker.volIdr,

change24h:ticker.change24h ?? 0

});






if(score<60)

return null;








return {


pair,


symbol:ticker.symbol,


lastPrice:ticker.lastPrice,


volIdr:ticker.volIdr,


rsi14:tech.rsi14,


emaFast:tech.emaFast,


emaSlow:tech.emaSlow,


trend:tech.trend,


opportunityScore:score,


confidence:
calculateConfidence(score),


signalRecommendation:

deriveSignalRecommendation(score)


};



}

catch(error){


console.error(

"Scanner failed",

pair,

error

);


return null;


}



});







const results=

await Promise.all(tasks);







results.forEach(

item=>{

if(item)

qualified.push(item);

}

);







qualified.sort(

(a,b)=>

b.opportunityScore -

a.opportunityScore

);







return {


scannedCount:pairsToScan.length,


qualifiedCount:qualified.length,


topOpportunities:

qualified.slice(0,10),


scannedAt:

new Date().toISOString()


};



}



}






export default new MarketScanner();

export * from "./types";

export * from "./filter";
