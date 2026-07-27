/**
==========================================================
AURA Trade OS
Pair Cache
Version : 0.1.1 Alpha
==========================================================
*/

import type { Pair } from "../models/pair";

export interface CachedPair {

  pair: Pair;

  updatedAt: number;

}

export class PairCache {

  private readonly cache =

    new Map<string, CachedPair>();

  /**
   * Cache lifetime
   * 1 hour
   */
  private readonly ttl =

    60 * 60 * 1000;

  /**
   * Save one pair
   */
  set(

    pair: Pair

  ): void {

    this.cache.set(

      pair.symbol.toUpperCase(),

      {

        pair,

        updatedAt: Date.now(),

      }

    );

  }

  /**
   * Replace all pairs
   */
  replace(

    pairs: Pair[]

  ): void {

    this.clear();

    for (const pair of pairs) {

      this.set(pair);

    }

  }

  /**
   * Get pair
   */
  get(

    symbol: string

  ): Pair | null {

    const item =

      this.cache.get(

        symbol.toUpperCase()

      );

    if (!item) {

      return null;

    }

    if (this.isExpired(item)) {

      this.cache.delete(

        symbol.toUpperCase()

      );

      return null;

    }

    return item.pair;

  }

  /**
   * Get all active pairs
   */
  getAll(): Pair[] {

    const result: Pair[] = [];

    for (const [key, value] of this.cache) {

      if (this.isExpired(value)) {

        this.cache.delete(key);

        continue;

      }

      result.push(value.pair);

    }

    return result;

  }

  /**
   * Search pair
   */
  search(

    keyword: string

  ): Pair[] {

    const query =

      keyword.toUpperCase();

    return this.getAll().filter(

      pair =>

        pair.symbol

          .toUpperCase()

          .includes(query)

        ||

        pair.baseAsset

          .toUpperCase()

          .includes(query)

        ||

        pair.quoteAsset

          .toUpperCase()

          .includes(query)

    );

  }

  /**
   * Filter by quote asset
   */
  byQuote(

    quoteAsset: string

  ): Pair[] {

    return this.getAll().filter(

      pair =>

        pair.quoteAsset

          .toUpperCase() ===

        quoteAsset.toUpperCase()

    );

  }

  /**
   * Filter by base asset
   */
  byBase(

    baseAsset: string

  ): Pair[] {

    return this.getAll().filter(

      pair =>

        pair.baseAsset

          .toUpperCase() ===

        baseAsset.toUpperCase()

    );

  }

  /**
   * Exists
   */
  has(

    symbol: string

  ): boolean {

    return this.get(symbol) !== null;

  }

  /**
   * Remove one pair
   */
  remove(

    symbol: string

  ): boolean {

    return this.cache.delete(

      symbol.toUpperCase()

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
   * Last synchronization
   */
  lastUpdated(

    symbol: string

  ): number | null {

    return this.cache.get(

      symbol.toUpperCase()

    )?.updatedAt ?? null;

  }

  /**
   * Expiration check
   */
  private isExpired(

    item: CachedPair

  ): boolean {

    return (

      Date.now() -

      item.updatedAt >

      this.ttl

    );

  }

}

const pairCache =

new PairCache();

export default pairCache;
