/**
==========================================================
AURA Trade OS
Market Cache
Version : 0.1.1 Alpha
==========================================================
*/

import pairCache from "./pairCache";
import tickerCache from "./tickerCache";
import orderBookCache from "./orderBookCache";

import type { Pair } from "../models/pair";
import type { Ticker } from "../models/ticker";
import type { OrderBook } from "../public/orderBook";

export interface MarketSnapshot {

  symbol: string;

  pair: Pair | null;

  ticker: Ticker | null;

  orderBook: OrderBook | null;

  updatedAt: number;

}

export class MarketCache {

  /**
   * Build market snapshot
   */
  snapshot(

    symbol: string

  ): MarketSnapshot {

    return {

      symbol: symbol.toUpperCase(),

      pair: pairCache.get(symbol),

      ticker: tickerCache.get(symbol),

      orderBook: orderBookCache.get(symbol),

      updatedAt: Date.now(),

    };

  }

  /**
   * Build snapshots for all pairs
   */
  snapshots(): MarketSnapshot[] {

    return pairCache

      .getAll()

      .map(pair =>

        this.snapshot(pair.symbol)

      );

  }

  /**
   * Returns true if
   * pair + ticker + orderbook exist.
   */
  ready(

    symbol: string

  ): boolean {

    return (

      pairCache.has(symbol)

      &&

      tickerCache.has(symbol)

      &&

      orderBookCache.has(symbol)

    );

  }

  /**
   * Number of ready markets
   */
  readyCount(): number {

    return this

      .snapshots()

      .filter(

        market =>

          market.pair

          &&

          market.ticker

          &&

          market.orderBook

      )

      .length;

  }

  /**
   * Total registered markets
   */
  size(): number {

    return pairCache.size();

  }

  /**
   * Clears every cache
   */
  clear(): void {

    pairCache.clear();

    tickerCache.clear();

    orderBookCache.clear();

  }

}

const marketCache =

new MarketCache();

export default marketCache;
