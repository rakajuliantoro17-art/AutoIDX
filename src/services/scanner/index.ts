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


// Dipakai HANYA sebagai fallback darurat kalau fetch daftar pair
// IDR dari Indodax (/api/pairs) gagal total - bukan lagi sumber
// kebenaran utama. Sumber utama: indodaxMarketService.getAllIdrPairs(),
// yang menarik SEMUA pair IDR yang aktif di Indodax (di-cache 6 jam).
private fallbackPairs=[

"btc_idr",

"eth_idr",

"sol_idr",

"ada_idr",

"xrp_idr"

];







/**
 * Ambil seluruh pair IDR yang aktif di Indodax. Kalau gagal
 * (network error dll), fallback ke daftar minimal supaya scanner
 * tidak mati total.
 */
private async resolvePairsToScan(): Promise<string[]> {
  try {
    const idrPairs = await indodaxMarketService.getAllIdrPairs();

    if (idrPairs.length > 0) {
      return idrPairs.map((p: { pair: string }) => p.pair);
    }

    return this.fallbackPairs;
  } catch (error) {
    console.error("MarketScanner: failed to resolve IDR pairs, using fallback", error);

    return this.fallbackPairs;
  }
}

async scanMarket(

pairsToScan?:string[],

criteria:Partial<ScanCriteria>={}

):Promise<MarketScanSummary>{

const resolvedPairs = pairsToScan ?? (await this.resolvePairsToScan());



const minVolume=

criteria.minVolumeIdr ?? 50_000_000;



const qualified:ScannedPairResult[]=[];







const tasks=

resolvedPairs.map(async pair=>{


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
    change24h:0 // TODO: data 24h change belum tersedia dari Indodax ticker API, perlu endpoint candle/trades terpisah
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


scannedCount:resolvedPairs.length,


qualifiedCount:qualified.length,


topOpportunities:

qualified.slice(0, criteria.limit ?? 50),


scannedAt:

new Date().toISOString()


};



}



}






export default new MarketScanner();

export * from "./types";

export * from "./filter";
