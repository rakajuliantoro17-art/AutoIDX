/**
==========================================================
AURA Trade OS
Market Scanner Types
Version : 0.0.1 Alpha
==========================================================
*/



export interface ScanCriteria {


/**
 * Minimum liquidity
 */

minVolumeIdr?: number;



/**
 * Maximum RSI entry filter
 */

maxRsi?: number;



/**
 * Minimum score accepted
 */

minOpportunityScore?: number;



/**
 * Require EMA bullish condition
 */

requireBullishEma?: boolean;



/**
 * Maximum pair result
 */

limit?: number;


/**
 * Batas maksimum spread bid-ask (%) supaya pair dengan order
 * book tipis/spread lebar (rawan slippage besar) tidak ikut
 * lolos walau volume & skor RSI/EMA-nya bagus. Default 3%.
 */

maxSpreadPercent?: number;


}









export type MarketTrend =

"BULLISH"

|

"BEARISH"

|

"SIDEWAYS";








export type ScannerSignal =

"STRONG_BUY"

|

"BUY"

|

"WAIT"

|

"AVOID"

|

"SELL";









export interface ScannedPairResult {


pair:string;



symbol:string;



lastPrice:number;



volIdr:number;



change24h?:number;



rsi14:number;



emaFast:number;



emaSlow:number;



trend:MarketTrend;



opportunityScore:number;



confidence:number;



signalRecommendation:ScannerSignal;



riskLevel?:

"LOW"

|

"MEDIUM"

|

"HIGH";



/**
 * Skor dari AI Prediction Engine (services/ai/prediction) --
 * TERPISAH dari opportunityScore (rule-based RSI/EMA/volume).
 * Sifatnya masih OBSERVASIONAL (ditampilkan untuk dipantau),
 * BELUM dipakai untuk keputusan BUY/SELL otomatis. Range -1..1.
 */
aiScore?: number;

/**
 * Arah prediksi AI: BULLISH / BEARISH / NEUTRAL.
 */
aiDirection?: "BULLISH" | "BEARISH" | "NEUTRAL";

/**
 * Confidence dari AI Prediction Engine, range 0..1.
 */
aiConfidence?: number;

/**
 * Spread bid-ask saat ini (%), dihitung dari order book
 * ((bestAsk - bestBid) / bestBid * 100). Pair dengan spread
 * di atas maxSpreadPercent (ScanCriteria) TIDAK akan lolos ke
 * qualifiedPairs -- field ini murni untuk visibilitas di
 * dashboard/log, menjelaskan MENGAPA suatu pair lolos/ditolak.
 */
spreadPercent?: number;

/**
 * Rasio volume candle terkini vs rata-rata (dari CandleAggregator/
 * VolumeAggregator, services/market/aggregators). >1 berarti
 * volume sedang di atas rata-rata (momentum naik), <1 di bawah
 * rata-rata. Murni informasional, belum jadi gerbang wajib.
 */
volumeRatio?: number;

/**
 * Rentang high-low candle relatif terhadap harga terakhir (%).
 * Indikator volatilitas kasar, murni informasional.
 */
priceRangePercent?: number;

}









export interface MarketScanSummary {


scannedCount:number;



/**
 * Jumlah pair yang lolos prefilter volume (t.volIdr >= minVolumeIdr)
 * dan masuk daftar kandidat yang benar-benar dianalisa RSI/EMA
 * (sebelum dipotong DEEP_SCAN_LIMIT). Field diagnostik -- membedakan
 * "tidak ada pair yang lolos filter volume" (candidatesCount: 0)
 * dari "pair lolos filter volume tapi analisa RSI/EMA gagal untuk
 * semuanya" (candidatesCount > 0, scoreStats.analyzedCount: 0).
 */

candidatesCount:number;



/**
 * Nilai volIdr (volume 24 jam dalam IDR) TERTINGGI yang terlihat di
 * antara seluruh consideredPairs, SEBELUM difilter minVolumeIdr.
 * Field diagnostik murni -- kalau candidatesCount: 0 tapi angka ini
 * juga sangat kecil/0 padahal mestinya ada pair besar seperti
 * btc_idr, itu tanda parsing volIdr dari Indodax bermasalah (bukan
 * market yang benar-benar sepi).
 */

maxVolIdrSeen:number;



qualifiedCount:number;



topOpportunities:

ScannedPairResult[];



/**
 * Ticker_id SEMUA pair yang lolos filter opportunityScore (bukan
 * cuma top 10 seperti topOpportunities) -- dipakai cron/scan.ts
 * untuk mengirim SEMUA pair qualified ke Trading Engine, bukan
 * cuma yang tampil di dashboard.
 */

qualifiedPairs:string[];



/**
 * Statistik skor opportunityScore SEMUA kandidat yang berhasil
 * dianalisa siklus ini (bukan cuma yang qualified) -- dipakai untuk
 * memantau apakah threshold minOpportunityScore terlalu ketat
 * (skor menumpuk sedikit di bawah thresholdUsed) atau market memang
 * sedang sepi peluang (skor jauh di bawah thresholdUsed).
 */

scoreStats:{

  analyzedCount:number;

  minScore:number;

  maxScore:number;

  avgScore:number;

  thresholdUsed:number;

};



scannedAt:string;



durationMs?:number;


}
