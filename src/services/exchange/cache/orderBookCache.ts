/**
==========================================================
AURA Trade OS
Order Book Cache
Version : 0.1.2 Alpha
==========================================================
*/

import type { OrderBook } from "../public/orderBook";

export interface CachedOrderBook {
  orderBook: OrderBook;
  updatedAt: number;
}

export class OrderBookCache {

  private readonly cache =
    new Map<string, CachedOrderBook>();

  /**
   * Order Book TTL
   *
   * 15 seconds
   */
  private readonly ttl = 15_000;

  /**
   * Save / Replace order book
   */
  set(
    symbol: string,
    orderBook: OrderBook
  ): void {
    this.cache.set(
      symbol.toUpperCase(),
      {
        orderBook,
        updatedAt: Date.now(),
      }
    );
  }

  /**
   * Get order book
   */
  get(
    symbol: string
  ): OrderBook | null {
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
    return item.orderBook;
  }

  /**
   * Returns all valid order books
   */
  getAll(): OrderBook[] {
    const result: OrderBook[] = [];
    for (const [key, value] of this.cache) {
      if (this.isExpired(value)) {
        this.cache.delete(key);
        continue;
      }
      result.push(value.orderBook);
    }
    return result;
  }

  /**
   * Check availability
   */
  has(
    symbol: string
  ): boolean {
    return this.get(symbol) !== null;
  }

  /**
   * Remove one order book
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
   * Last update timestamp
   */
  lastUpdated(
    symbol: string
  ): number | null {
    return this.cache.get(
      symbol.toUpperCase()
    )?.updatedAt ?? null;
  }

  /**
   * Best Bid
   */
  bestBid(
    symbol: string
  ) {
    const book =
      this.get(symbol);
    return book?.bids?.[0] ?? null;
  }

  /**
   * Best Ask
   */
  bestAsk(
    symbol: string
  ) {
    const book =
      this.get(symbol);
    return book?.asks?.[0] ?? null;
  }

  /**
   * Expiration
   */
  private isExpired(
    item: CachedOrderBook
  ): boolean {
    return (
      Date.now() -
      item.updatedAt >
      this.ttl
    );
  }

}

const orderBookCache =
new OrderBookCache();

export default orderBookCache;
