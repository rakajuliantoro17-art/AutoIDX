/**
==========================================================
AURA Trade OS
Indodax Market Service
Version : 0.2.0 Alpha

Perubahan dari 0.1.0 (2 bug fungsional diperbaiki):
1. normalizeTicker() sebelumnya TIDAK PERNAH menerima parameter
   `symbol` dari getTicker() -- selalu membaca `response.data.symbol`
   yang nilainya memang tidak pernah ada di response ticker Indodax
   (endpoint ticker tidak mengembalikan nama pair). Akibatnya field
   `symbol` di MarketTick SELALU string kosong, apa pun pair yang
   diminta. Sekarang `symbol` diteruskan eksplisit dari parameter
   getTicker(), bukan ditebak dari response.
2. `volume` sebelumnya hardcode membaca `ticker.vol_btc` untuk
   SEMUA pair (sisa asumsi single-pair BTC). Untuk pair selain
   BTC/IDR ini akan selalu 0 karena field aslinya bernama
   `vol_<simbol_koin>` (mis. vol_eth untuk eth_idr). Sekarang
   field volume diturunkan dinamis dari symbol, konsisten dengan
   pola yang sama di services/indodax/market.js.

CATATAN KREDENSIAL: file ini HANYA memanggil publicRequest()
(ticker publik), yang TIDAK memerlukan API key/secret sama sekali
(lihat indodaxClient.ts) -- jadi berbeda dengan account.ts/
orderExecutor.ts, singleton indodaxClient di sini AMAN dipakai
apa adanya dan TIDAK perlu diganti ke kredensial per-akun.
==========================================================
Live Market Data Adapter
==========================================================
*/

import indodaxClient from "./indodaxClient";

import type {
  MarketTick,
  MarketCandle,
  ExchangeResponse,
} from "../types";

export class ExchangeMarketService {

  /**
   * Get ticker
   */
  async getTicker(symbol: string): Promise<MarketTick> {

    const response = await indodaxClient.publicRequest(`${symbol}/ticker`);

    if (!response.success) {
      throw new Error(response.message);
    }

    return this.normalizeTicker(response, symbol);

  }

  /**
   * Get last price
   */
  async getPrice(symbol: string): Promise<number> {

    const ticker = await this.getTicker(symbol);

    return ticker.price;

  }

  /**
   * Normalize ticker response.
   *
   * `symbol` WAJIB diteruskan eksplisit dari pemanggil (getTicker)
   * -- response ticker Indodax sendiri tidak menyertakan nama pair.
   */
  private normalizeTicker(
    response: ExchangeResponse,
    symbol: string,
  ): MarketTick {

    const ticker = response.data.ticker;

    // Field volume Indodax bernama dinamis sesuai simbol koin,
    // contoh: "vol_btc" untuk btc_idr, "vol_eth" untuk eth_idr.
    const coinSymbol = symbol.split("_")[0]?.toLowerCase() ?? "";
    const volumeKey = `vol_${coinSymbol}`;

    return {
      symbol,
      bid: Number(ticker.buy),
      ask: Number(ticker.sell),
      price: Number(ticker.last),
      volume: Number(ticker[volumeKey] ?? 0),
      timestamp: Date.now(),
    };

  }

  /**
   * Generate candle
   *
   * Placeholder for websocket/candle builder
   */
  buildCandle(tick: MarketTick, previous?: MarketCandle): MarketCandle {

    if (!previous) {

      return {
        symbol: tick.symbol,
        open: tick.price,
        high: tick.price,
        low: tick.price,
        close: tick.price,
        volume: tick.volume,
        timestamp: tick.timestamp,
      };

    }

    return {
      symbol: tick.symbol,
      open: previous.open,
      high: Math.max(previous.high, tick.price),
      low: Math.min(previous.low, tick.price),
      close: tick.price,
      volume: previous.volume + tick.volume,
      timestamp: tick.timestamp,
    };

  }

}

const exchangeMarket = new ExchangeMarketService();

export default exchangeMarket;
