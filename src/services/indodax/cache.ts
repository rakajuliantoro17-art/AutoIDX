/**
 * ============================================================
 * AURA Trade OS
 * Indodax Cache Service
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Cache data Indodax yang bersifat read-heavy.
 * - Mengurangi request berulang ke exchange.
 * - TTL management.
 * - Stale-data detection.
 * - Explicit invalidation.
 * - Prevent cache poisoning through controlled writes.
 *
 * NOT responsible for:
 * - Trading
 * - Strategy
 * - Risk decisions
 * - Order execution
 * - Persistent storage
 *
 * IMPORTANT:
 * Cached data MUST NOT be treated as authoritative exchange
 * state for order execution.
 *
 * Flow:
 *
 * Indodax API
 *      ↓
 * Cache
 *      ↓
 * Balance / Market Service
 *
 * Trading-critical operations should refresh exchange state.
 * ============================================================
 */

export interface IndodaxCacheEntry<T> {
  value: T;
  createdAt: number;
  expiresAt: number;
  lastAccessedAt: number;
}

export interface IndodaxCacheOptions {
  ttlMs?: number;
  maxEntries?: number;
  now?: () => number;
}

export interface IndodaxCacheStats {
  size: number;
  hits: number;
  misses: number;
  evictions: number;
  invalidations: number;
}

export interface IndodaxCacheReadOptions {
  allowStale?: boolean;
}

export interface IndodaxCacheResult<T> {
  value: T;
  stale: boolean;
  ageMs: number;
  expiresInMs: number;
}

export class IndodaxCacheError extends Error {
  public readonly code: string;

  public constructor(
    message: string,
    code = "INDODAX_CACHE_ERROR",
  ) {
    super(message);

    this.name = "IndodaxCacheError";
    this.code = code;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

export class IndodaxCache {
  private readonly entries =
    new Map<
      string,
      IndodaxCacheEntry<unknown>
    >();

  private readonly defaultTtlMs: number;

  private readonly maxEntries: number;

  private readonly now: () => number;

  private hits = 0;

  private misses = 0;

  private evictions = 0;

  private invalidations = 0;

  public constructor(
    options: IndodaxCacheOptions = {},
  ) {
    this.defaultTtlMs =
      options.ttlMs ??
      5_000;

    this.maxEntries =
      options.maxEntries ??
      500;

    this.now =
      options.now ??
      (() => Date.now());

    this.validateOptions();
  }

  /**
   * Store a value in cache.
   */
  public set<T>(
    key: string,
    value: T,
    ttlMs = this.defaultTtlMs,
  ): void {
    this.validateKey(key);

    if (
      !Number.isFinite(ttlMs) ||
      ttlMs <= 0
    ) {
      throw new IndodaxCacheError(
        "TTL must be a positive finite number",
        "INVALID_TTL",
      );
    }

    if (
      this.entries.has(key)
    ) {
      this.entries.delete(key);
    }

    this.enforceCapacity();

    const createdAt =
      this.now();

    this.entries.set(key, {
      value,
      createdAt,
      expiresAt:
        createdAt + ttlMs,
      lastAccessedAt:
        createdAt,
    });
  }

  /**
   * Read cached value.
   *
   * By default expired entries are treated
   * as cache misses.
   */
  public get<T>(
    key: string,
    options: IndodaxCacheReadOptions = {},
  ): IndodaxCacheResult<T> | null {
    this.validateKey(key);

    const entry =
      this.entries.get(key);

    if (!entry) {
      this.misses += 1;

      return null;
    }

    const now =
      this.now();

    const stale =
      now >= entry.expiresAt;

    if (
      stale &&
      !options.allowStale
    ) {
      this.entries.delete(key);
      this.misses += 1;

      return null;
    }

    entry.lastAccessedAt =
      now;

    this.hits += 1;

    return {
      value:
        entry.value as T,

      stale,

      ageMs:
        Math.max(
          0,
          now -
            entry.createdAt,
        ),

      expiresInMs:
        Math.max(
          0,
          entry.expiresAt -
            now,
        ),
    };
  }

  /**
   * Return cached value directly.
   */
  public getValue<T>(
    key: string,
  ): T | null {
    const result =
      this.get<T>(key);

    return result
      ? result.value
      : null;
  }

  /**
   * Read a value even when stale.
   *
   * Intended for observability or fallback
   * scenarios, NOT for order execution.
   */
  public getStale<T>(
    key: string,
  ): IndodaxCacheResult<T> | null {
    return this.get<T>(
      key,
      {
        allowStale: true,
      },
    );
  }

  /**
   * Check whether a key exists and is still valid.
   */
  public has(
    key: string,
  ): boolean {
    this.validateKey(key);

    const entry =
      this.entries.get(key);

    if (!entry) {
      return false;
    }

    if (
      this.now() >=
      entry.expiresAt
    ) {
      this.entries.delete(key);

      return false;
    }

    return true;
  }

  /**
   * Check whether a key exists even if expired.
   */
  public hasAny(
    key: string,
  ): boolean {
    this.validateKey(key);

    return this.entries.has(key);
  }

  /**
   * Remove one cached value.
   */
  public invalidate(
    key: string,
  ): boolean {
    this.validateKey(key);

    const deleted =
      this.entries.delete(key);

    if (deleted) {
      this.invalidations += 1;
    }

    return deleted;
  }

  /**
   * Remove all cache entries.
   */
  public clear(): void {
    if (
      this.entries.size > 0
    ) {
      this.invalidations +=
        this.entries.size;
    }

    this.entries.clear();
  }

  /**
   * Remove expired entries.
   */
  public cleanupExpired(): number {
    const now =
      this.now();

    let removed = 0;

    for (
      const [
        key,
        entry,
      ] of this.entries
    ) {
      if (
        now >=
        entry.expiresAt
      ) {
        this.entries.delete(
          key,
        );

        removed += 1;
      }
    }

    return removed;
  }

  /**
   * Number of currently stored entries.
   */
  public size(): number {
    return this.entries.size;
  }

  /**
   * Cache statistics.
   */
  public getStats(): IndodaxCacheStats {
    return {
      size:
        this.entries.size,

      hits:
        this.hits,

      misses:
        this.misses,

      evictions:
        this.evictions,

      invalidations:
        this.invalidations,
    };
  }

  /**
   * Reset cache statistics without
   * deleting cached values.
   */
  public resetStats(): void {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.invalidations = 0;
  }

  /**
   * Return all keys.
   *
   * Useful for diagnostics.
   */
  public keys(): string[] {
    return Array.from(
      this.entries.keys(),
    );
  }

  /**
   * Return remaining TTL.
   */
  public getTtl(
    key: string,
  ): number | null {
    this.validateKey(key);

    const entry =
      this.entries.get(key);

    if (!entry) {
      return null;
    }

    return Math.max(
      0,
      entry.expiresAt -
        this.now(),
    );
  }

  /**
   * Update an existing cache entry
   * without changing its value.
   *
   * Useful for TTL refresh after a validated
   * exchange response.
   */
  public refresh<T>(
    key: string,
    ttlMs = this.defaultTtlMs,
  ): boolean {
    this.validateKey(key);

    const entry =
      this.entries.get(key);

    if (!entry) {
      return false;
    }

    if (
      !Number.isFinite(ttlMs) ||
      ttlMs <= 0
    ) {
      throw new IndodaxCacheError(
        "TTL must be a positive finite number",
        "INVALID_TTL",
      );
    }

    const now =
      this.now();

    entry.createdAt =
      now;

    entry.expiresAt =
      now + ttlMs;

    entry.lastAccessedAt =
      now;

    return true;
  }

  /**
   * Atomic get-or-set helper.
   *
   * The loader should retrieve fresh data from
   * Indodax when the cache does not contain a
   * valid value.
   */
  public async getOrSet<T>(
    key: string,
    loader: () => Promise<T>,
    ttlMs = this.defaultTtlMs,
  ): Promise<T> {
    const cached =
      this.get<T>(key);

    if (cached) {
      return cached.value;
    }

    const value =
      await loader();

    this.set(
      key,
      value,
      ttlMs,
    );

    return value;
  }

  /**
   * Enforce maximum cache capacity.
   *
   * Uses least-recently-accessed eviction.
   */
  private enforceCapacity(): void {
    while (
      this.entries.size >=
      this.maxEntries
    ) {
      let oldestKey:
        | string
        | undefined;

      let oldestAccess =
        Number.POSITIVE_INFINITY;

      for (
        const [
          key,
          entry,
        ] of this.entries
      ) {
        if (
          entry.lastAccessedAt <
          oldestAccess
        ) {
          oldestAccess =
            entry.lastAccessedAt;

          oldestKey =
            key;
        }
      }

      if (
        oldestKey ===
        undefined
      ) {
        break;
      }

      this.entries.delete(
        oldestKey,
      );

      this.evictions += 1;
    }
  }

  /**
   * Validate constructor options.
   */
  private validateOptions(): void {
    if (
      !Number.isFinite(
        this.defaultTtlMs,
      ) ||
      this.defaultTtlMs <= 0
    ) {
      throw new IndodaxCacheError(
        "Default TTL must be a positive finite number",
        "INVALID_DEFAULT_TTL",
      );
    }

    if (
      !Number.isInteger(
        this.maxEntries,
      ) ||
      this.maxEntries <= 0
    ) {
      throw new IndodaxCacheError(
        "maxEntries must be a positive integer",
        "INVALID_MAX_ENTRIES",
      );
    }
  }

  /**
   * Validate cache key.
   */
  private validateKey(
    key: string,
  ): void {
    if (
      typeof key !==
        "string" ||
      key.trim().length ===
        0
    ) {
      throw new IndodaxCacheError(
        "Cache key is required",
        "CACHE_KEY_REQUIRED",
      );
    }
  }
}

/**
 * Standard cache keys used by the
 * Indodax integration layer.
 *
 * Keeping these centralized prevents
 * accidental duplicate cache keys.
 */
export const INDODAX_CACHE_KEYS =
  {
    BALANCE: "indodax:balance",

    ACCOUNT_INFO:
      "indodax:account-info",

    TICKER: (
      pair: string,
    ) =>
      `indodax:ticker:${pair
        .trim()
        .toLowerCase()}`,

    ORDER_BOOK: (
      pair: string,
    ) =>
      `indodax:order-book:${pair
        .trim()
        .toLowerCase()}`,

    MARKET: (
      pair: string,
    ) =>
      `indodax:market:${pair
        .trim()
        .toLowerCase()}`,
  } as const;

/**
 * Factory helper.
 */
export function createIndodaxCache(
  options?: IndodaxCacheOptions,
): IndodaxCache {
  return new IndodaxCache(
    options,
  );
}

export default IndodaxCache;
