/**
==========================================================
AURA Trade OS
AI Cache Engine
Version : 0.1.0 Alpha
==========================================================
*/

export interface CacheEntry<T = unknown> {

  key: string;

  provider: string;

  value: T;

  createdAt: number;

  expiresAt: number;

}

export interface CacheOptions {

  ttl?: number;

}

const DEFAULT_TTL =

5 * 60 * 1000;

export class AICache {

  private cache =

    new Map<

      string,

      CacheEntry

    >();

  /**
   * Get
   */

  get<T = unknown>(

    key: string,

    provider: string

  ): T | null {

    const cacheKey =

      this.buildKey(

        key,

        provider

      );

    const entry =

      this.cache.get(

        cacheKey

      );

    if (!entry) {

      return null;

    }

    if (

      Date.now() >

      entry.expiresAt

    ) {

      this.cache.delete(

        cacheKey

      );

      return null;

    }

    return entry.value as T;

  }

  /**
   * Save
   */

  set<T = unknown>(

    key: string,

    provider: string,

    value: T,

    options: CacheOptions = {}

  ): void {

    const ttl =

      options.ttl ??

      DEFAULT_TTL;

    const now =

      Date.now();

    this.cache.set(

      this.buildKey(

        key,

        provider

      ),

      {

        key,

        provider,

        value,

        createdAt: now,

        expiresAt:

          now + ttl,

      }

    );

  }

  /**
   * Delete
   */

  delete(

    key: string,

    provider: string

  ): void {

    this.cache.delete(

      this.buildKey(

        key,

        provider

      )

    );

  }

  /**
   * Clear
   */

  clear(): void {

    this.cache.clear();

  }

  /**
   * Cache Size
   */

  size(): number {

    return this.cache.size;

  }

  /**
   * Remove Expired
   */

  cleanup(): void {

    const now =

      Date.now();

    for (

      const [

        key,

        entry

      ] of this.cache

    ) {

      if (

        entry.expiresAt <

        now

      ) {

        this.cache.delete(

          key

        );

      }

    }

  }

  /**
   * Build Key
   */

  private buildKey(

    prompt: string,

    provider: string

  ): string {

    return

      `${provider}:${prompt}`;

  }

}

const aiCache =

new AICache();

export default aiCache;
