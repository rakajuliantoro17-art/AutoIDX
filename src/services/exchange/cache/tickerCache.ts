/**
==========================================================
AURA Trade OS
Ticker Cache
Version : 0.1.1 Alpha
==========================================================
*/

import type { Ticker } from "../models/ticker";

export interface CachedTicker {

  ticker: Ticker;

  updatedAt: number;

}

export class TickerCache {

  private readonly cache =

    new Map<string, CachedTicker>();

  /**
   * Default TTL (milliseconds)
   * 30 seconds
   */
  private readonly ttl = 30_000;

  /**
   * Save / Replace ticker
   */
  set(

    pair: string,

    ticker: Ticker

  ): void {

    this.cache.set(

      pair.toUpperCase(),

      {

        ticker,

        updatedAt: Date.now(),

      }

    );

  }

  /**
   * Read ticker
   */
  get(

    pair: string

  ): Ticker | null {

    const item =

      this.cache.get(

        pair.toUpperCase()

      );

    if (!item) {

      return null;

    }

    if (this.isExpired(item)) {

      this.cache.delete(

        pair.toUpperCase()

      );

      return null;

    }

    return item.ticker;

  }

  /**
   * Returns all valid tickers
   */
  getAll(): Ticker[] {

    const result: Ticker[] = [];

    for (const [key, value] of this.cache) {

      if (this.isExpired(value)) {

        this.cache.delete(key);

        continue;

      }

      result.push(value.ticker);

    }

    return result;

  }

  /**
   * Check existence
   */
  has(

    pair: string

  ): boolean {

    return this.get(pair) !== null;

  }

  /**
   * Remove one ticker
   */
  remove(

    pair: string

  ): boolean {

    return this.cache.delete(

      pair.toUpperCase()

    );

  }

  /**
   * Clear cache
   */
  clear(): void {

    this.cache.clear();

  }

  /**
   * Cache size
   */
  size(): number {

    return this.cache.size;

  }

  /**
   * Last update timestamp
   */
  lastUpdated(

    pair: string

  ): number | null {

    const item =

      this.cache.get(

        pair.toUpperCase()

      );

    return item?.updatedAt ?? null;

  }

  /**
   * Expiration check
   */
  private isExpired(

    item: CachedTicker

  ): boolean {

    return (

      Date.now() -

      item.updatedAt >

      this.ttl

    );

  }

}

const tickerCache =

new TickerCache();

export default tickerCache;
