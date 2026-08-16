/**
 * ============================================================
 * AURA Trade OS
 * Indodax Rate Limiter
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Protect Indodax API from excessive requests.
 * - Control public API request frequency.
 * - Control private trade request frequency.
 * - Control cancel-order request frequency.
 * - Provide async queue-based throttling.
 * - Prevent concurrent requests from bypassing limits.
 *
 * Official INDODAX limits:
 *
 * Public API:
 *   180 requests / minute
 *
 * Trade API:
 *   20 requests / second
 *   per account and pair
 *
 * Cancel Order:
 *   30 requests / second
 *
 * This service does NOT:
 * - execute orders
 * - authenticate requests
 * - make trading decisions
 * - implement strategy
 * - implement risk management
 *
 * Architecture:
 *
 * Service
 *    ↓
 * IndodaxLimiter
 *    ↓
 * IndodaxClient
 *    ↓
 * Indodax API
 * ============================================================
 */

/* ============================================================
 * Types
 * ============================================================
 */

export type IndodaxRateLimitScope =
  | "public"
  | "trade"
  | "cancel";

export interface IndodaxRateLimitConfig {
  /**
   * Maximum number of requests allowed
   * inside the configured window.
   */
  maxRequests: number;

  /**
   * Window size in milliseconds.
   */
  windowMs: number;

  /**
   * Optional maximum queue size.
   *
   * 0 means unlimited.
   */
  maxQueueSize?: number;

  /**
   * Maximum time a request may wait
   * before being rejected.
   */
  maxWaitMs?: number;
}

export interface IndodaxLimiterOptions {
  public?: Partial<IndodaxRateLimitConfig>;

  trade?: Partial<IndodaxRateLimitConfig>;

  cancel?: Partial<IndodaxRateLimitConfig>;

  /**
   * Global safety limit.
   *
   * This is an additional application-level
   * protection layer and does not replace
   * INDODAX exchange limits.
   */
  global?: Partial<IndodaxRateLimitConfig>;
}

export interface IndodaxLimiterStats {
  scope: IndodaxRateLimitScope | "global";

  maxRequests: number;

  windowMs: number;

  currentRequests: number;

  queuedRequests: number;

  availableRequests: number;

  rejectedRequests: number;

  totalRequests: number;

  lastRequestAt?: number;
}

export class IndodaxRateLimitError extends Error {
  public readonly scope:
    | IndodaxRateLimitScope
    | "global";

  public readonly retryAfterMs: number;

  public constructor(
    message: string,
    scope:
      | IndodaxRateLimitScope
      | "global",
    retryAfterMs: number,
  ) {
    super(message);

    this.name =
      "IndodaxRateLimitError";

    this.scope = scope;

    this.retryAfterMs =
      Math.max(
        0,
        Math.ceil(retryAfterMs),
      );

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/* ============================================================
 * Internal Types
 * ============================================================
 */

interface RequestRecord {
  timestamp: number;
}

interface QueueItem<T> {
  createdAt: number;

  execute: () => Promise<T>;

  resolve: (value: T) => void;

  reject: (reason?: unknown) => void;
}

interface LimiterBucket {
  scope:
    | IndodaxRateLimitScope
    | "global";

  config: Required<IndodaxRateLimitConfig>;

  requests: RequestRecord[];

  queue: QueueItem<any>[];

  rejectedRequests: number;

  totalRequests: number;

  lastRequestAt?: number;

  processing: boolean;
}

/* ============================================================
 * Defaults
 * ============================================================
 */

const DEFAULT_PUBLIC_CONFIG:
  Required<IndodaxRateLimitConfig> = {
  maxRequests: 180,
  windowMs: 60_000,
  maxQueueSize: 1_000,
  maxWaitMs: 55_000,
};

const DEFAULT_TRADE_CONFIG:
  Required<IndodaxRateLimitConfig> = {
  maxRequests: 20,
  windowMs: 1_000,
  maxQueueSize: 100,
  maxWaitMs: 5_000,
};

const DEFAULT_CANCEL_CONFIG:
  Required<IndodaxRateLimitConfig> = {
  maxRequests: 30,
  windowMs: 1_000,
  maxQueueSize: 100,
  maxWaitMs: 5_000,
};

/**
 * Application-level global protection.
 *
 * This is deliberately conservative.
 *
 * It is NOT an official INDODAX limit.
 * It protects the application from accidentally
 * generating an abnormal request storm.
 */
const DEFAULT_GLOBAL_CONFIG:
  Required<IndodaxRateLimitConfig> = {
  maxRequests: 100,
  windowMs: 1_000,
  maxQueueSize: 500,
  maxWaitMs: 10_000,
};

/* ============================================================
 * IndodaxLimiter
 * ============================================================
 */

export class IndodaxLimiter {
  private readonly buckets:
    Map<
      IndodaxRateLimitScope | "global",
      LimiterBucket
    >;

  public constructor(
    options: IndodaxLimiterOptions = {},
  ) {
    this.buckets =
      new Map();

    this.buckets.set(
      "public",
      this.createBucket(
        "public",
        {
          ...DEFAULT_PUBLIC_CONFIG,
          ...(options.public ?? {}),
        },
      ),
    );

    this.buckets.set(
      "trade",
      this.createBucket(
        "trade",
        {
          ...DEFAULT_TRADE_CONFIG,
          ...(options.trade ?? {}),
        },
      ),
    );

    this.buckets.set(
      "cancel",
      this.createBucket(
        "cancel",
        {
          ...DEFAULT_CANCEL_CONFIG,
          ...(options.cancel ?? {}),
        },
      ),
    );

    this.buckets.set(
      "global",
      this.createBucket(
        "global",
        {
          ...DEFAULT_GLOBAL_CONFIG,
          ...(options.global ?? {}),
        },
      ),
    );
  }

  /* ==========================================================
   * Public API
   * ==========================================================
   */

  /**
   * Execute a request under the selected rate-limit scope.
   *
   * The request is protected by:
   *
   *   global limiter
   *        +
   *   scope limiter
   */
  public async execute<T>(
    scope: IndodaxRateLimitScope,
    operation: () => Promise<T>,
  ): Promise<T> {
    if (
      typeof operation !==
      "function"
    ) {
      throw new TypeError(
        "Indodax limiter operation must be a function",
      );
    }

    /**
     * Global limiter first.
     */
    await this.acquire(
      "global",
    );

    /**
     * Scope-specific limiter.
     */
    await this.acquire(
      scope,
    );

    return operation();
  }

  /**
   * Acquire permission without
   * executing an operation.
   */
  public async acquire(
    scope:
      | IndodaxRateLimitScope
      | "global",
  ): Promise<void> {
    const bucket =
      this.getBucket(scope);

    return new Promise<void>(
      (
        resolve,
        reject,
      ) => {
        const now =
          Date.now();

        this.cleanup(
          bucket,
          now,
        );

        if (
          bucket.config
            .maxQueueSize >
            0 &&
          bucket.queue.length >=
            bucket.config.maxQueueSize
        ) {
          bucket.rejectedRequests +=
            1;

          reject(
            new IndodaxRateLimitError(
              `Indodax ${scope} rate-limit queue is full`,
              scope,
              this.calculateRetryAfter(
                bucket,
                now,
              ),
            ),
          );

          return;
        }

        const queueItem:
          QueueItem<void> = {
          createdAt: now,

          execute:
            async () => {
              return undefined;
            },

          resolve,

          reject,
        };

        bucket.queue.push(
          queueItem,
        );

        this.processBucket(
          bucket,
        );
      },
    );
  }

  /**
   * Check whether a request can
   * be executed immediately.
   */
  public canExecute(
    scope:
      | IndodaxRateLimitScope
      | "global",
  ): boolean {
    const bucket =
      this.getBucket(scope);

    const now =
      Date.now();

    this.cleanup(
      bucket,
      now,
    );

    return (
      bucket.requests.length <
      bucket.config.maxRequests
    );
  }

  /**
   * Return milliseconds until
   * the next request slot becomes
   * available.
   */
  public retryAfter(
    scope:
      | IndodaxRateLimitScope
      | "global",
  ): number {
    const bucket =
      this.getBucket(scope);

    const now =
      Date.now();

    this.cleanup(
      bucket,
      now,
    );

    return this.calculateRetryAfter(
      bucket,
      now,
    );
  }

  /* ==========================================================
   * Convenience Methods
   * ==========================================================
   */

  public async executePublic<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    return this.execute(
      "public",
      operation,
    );
  }

  public async executeTrade<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    return this.execute(
      "trade",
      operation,
    );
  }

  public async executeCancel<T>(
    operation: () => Promise<T>,
  ): Promise<T> {
    return this.execute(
      "cancel",
      operation,
    );
  }

  public async acquirePublic(): Promise<void> {
    await this.acquire(
      "global",
    );

    await this.acquire(
      "public",
    );
  }

  public async acquireTrade(): Promise<void> {
    await this.acquire(
      "global",
    );

    await this.acquire(
      "trade",
    );
  }

  public async acquireCancel(): Promise<void> {
    await this.acquire(
      "global",
    );

    await this.acquire(
      "cancel",
    );
  }

  /* ==========================================================
   * Statistics
   * ==========================================================
   */

  public getStats(
    scope:
      | IndodaxRateLimitScope
      | "global",
  ): IndodaxLimiterStats {
    const bucket =
      this.getBucket(scope);

    const now =
      Date.now();

    this.cleanup(
      bucket,
      now,
    );

    const currentRequests =
      bucket.requests.length;

    return {
      scope,

      maxRequests:
        bucket.config.maxRequests,

      windowMs:
        bucket.config.windowMs,

      currentRequests,

      queuedRequests:
        bucket.queue.length,

      availableRequests:
        Math.max(
          0,
          bucket.config.maxRequests -
            currentRequests,
        ),

      rejectedRequests:
        bucket.rejectedRequests,

      totalRequests:
        bucket.totalRequests,

      lastRequestAt:
        bucket.lastRequestAt,
    };
  }

  public getAllStats(): IndodaxLimiterStats[] {
    return [
      this.getStats(
        "global",
      ),
      this.getStats(
        "public",
      ),
      this.getStats(
        "trade",
      ),
      this.getStats(
        "cancel",
      ),
    ];
  }

  /**
   * Reset runtime counters.
   *
   * Useful for tests and controlled
   * runtime reinitialization.
   */
  public reset(): void {
    for (
      const bucket of
        this.buckets.values()
    ) {
      bucket.requests = [];

      bucket.queue = [];

      bucket.rejectedRequests =
        0;

      bucket.totalRequests =
        0;

      bucket.lastRequestAt =
        undefined;

      bucket.processing =
        false;
    }
  }

  /**
   * Clear queued requests.
   *
   * Existing requests already granted
   * are not affected.
   */
  public clearQueue(
    scope:
      | IndodaxRateLimitScope
      | "global",
  ): number {
    const bucket =
      this.getBucket(scope);

    const count =
      bucket.queue.length;

    const queued =
      bucket.queue.splice(
        0,
        bucket.queue.length,
      );

    const error =
      new IndodaxRateLimitError(
        `Queued Indodax ${scope} requests were cancelled`,
        scope,
        0,
      );

    for (
      const item of queued
    ) {
      item.reject(
        error,
      );
    }

    return count;
  }

  /* ==========================================================
   * Configuration
   * ==========================================================
   */

  public getConfig(
    scope:
      | IndodaxRateLimitScope
      | "global",
  ): Required<IndodaxRateLimitConfig> {
    return {
      ...this.getBucket(
        scope,
      ).config,
    };
  }

  /* ==========================================================
   * Internal Bucket Processing
   * ==========================================================
   */

  private createBucket(
    scope:
      | IndodaxRateLimitScope
      | "global",
    config: Required<IndodaxRateLimitConfig>,
  ): LimiterBucket {
    this.validateConfig(
      config,
    );

    return {
      scope,

      config,

      requests: [],

      queue: [],

      rejectedRequests: 0,

      totalRequests: 0,

      lastRequestAt:
        undefined,

      processing: false,
    };
  }

  private getBucket(
    scope:
      | IndodaxRateLimitScope
      | "global",
  ): LimiterBucket {
    const bucket =
      this.buckets.get(
        scope,
      );

    if (!bucket) {
      throw new Error(
        `Unknown Indodax limiter scope: ${scope}`,
      );
    }

    return bucket;
  }

  /**
   * Process queued requests serially.
   */
  private processBucket(
    bucket: LimiterBucket,
  ): void {
    if (
      bucket.processing
    ) {
      return;
    }

    bucket.processing =
      true;

    const process =
      async (): Promise<void> => {
        try {
          while (
            bucket.queue.length >
            0
          ) {
            const now =
              Date.now();

            this.cleanup(
              bucket,
              now,
            );

            /**
             * Remove requests that
             * exceeded maximum waiting time.
             */
            this.rejectExpiredQueueItems(
              bucket,
              now,
            );

            if (
              bucket.queue.length ===
              0
            ) {
              break;
            }

            if (
              bucket.requests.length >=
              bucket.config.maxRequests
            ) {
              const waitMs =
                this.calculateRetryAfter(
                  bucket,
                  now,
                );

              await this.sleep(
                waitMs,
              );

              continue;
            }

            const item =
              bucket.queue.shift();

            if (!item) {
              continue;
            }

            const requestTime =
              Date.now();

            bucket.requests.push(
              {
                timestamp:
                  requestTime,
              },
            );

            bucket.lastRequestAt =
              requestTime;

            bucket.totalRequests +=
              1;

            try {
              const result =
                await item.execute();

              item.resolve(
                result,
              );
            } catch (error) {
              item.reject(
                error,
              );
            }
          }
        } finally {
          bucket.processing =
            false;

          /**
           * Protect against a request being
           * added between the final loop check
           * and processing flag reset.
           */
          if (
            bucket.queue.length >
            0
          ) {
            this.processBucket(
              bucket,
            );
          }
        }
      };

    void process();
  }

  /**
   * Remove old timestamps outside
   * the active rate-limit window.
   */
  private cleanup(
    bucket: LimiterBucket,
    now: number,
  ): void {
    const cutoff =
      now -
      bucket.config.windowMs;

    while (
      bucket.requests.length >
        0 &&
      bucket.requests[0]!.timestamp <=
        cutoff
    ) {
      bucket.requests.shift();
    }
  }

  /**
   * Reject queue items that have
   * waited too long.
   */
  private rejectExpiredQueueItems(
    bucket: LimiterBucket,
    now: number,
  ): void {
    const maxWait =
      bucket.config.maxWaitMs;

    if (
      maxWait <= 0
    ) {
      return;
    }

    while (
      bucket.queue.length >
        0
    ) {
      const item =
        bucket.queue[0];

      if (!item) {
        break;
      }

      if (
        now -
          item.createdAt <=
        maxWait
      ) {
        break;
      }

      bucket.queue.shift();

      bucket.rejectedRequests +=
        1;

      item.reject(
        new IndodaxRateLimitError(
          `Indodax ${bucket.scope} request exceeded maximum wait time`,
          bucket.scope,
          this.calculateRetryAfter(
            bucket,
            now,
          ),
        ),
      );
    }
  }

  /**
   * Calculate when the oldest
   * request leaves the active window.
   */
  private calculateRetryAfter(
    bucket: LimiterBucket,
    now: number,
  ): number {
    if (
      bucket.requests.length <
      bucket.config.maxRequests
    ) {
      return 0;
    }

    const oldest =
      bucket.requests[0];

    if (!oldest) {
      return 0;
    }

    return Math.max(
      0,
      oldest.timestamp +
        bucket.config.windowMs -
        now,
    );
  }

  /* ==========================================================
   * Validation
   * ==========================================================
   */

  private validateConfig(
    config: Required<IndodaxRateLimitConfig>,
  ): void {
    if (
      !Number.isFinite(
        config.maxRequests,
      ) ||
      config.maxRequests <= 0
    ) {
      throw new TypeError(
        "Rate limiter maxRequests must be greater than zero",
      );
    }

    if (
      !Number.isFinite(
        config.windowMs,
      ) ||
      config.windowMs <= 0
    ) {
      throw new TypeError(
        "Rate limiter windowMs must be greater than zero",
      );
    }

    if (
      !Number.isFinite(
        config.maxQueueSize,
      ) ||
      config.maxQueueSize < 0
    ) {
      throw new TypeError(
        "Rate limiter maxQueueSize must be zero or greater",
      );
    }

    if (
      !Number.isFinite(
        config.maxWaitMs,
      ) ||
      config.maxWaitMs < 0
    ) {
      throw new TypeError(
        "Rate limiter maxWaitMs must be zero or greater",
      );
    }
  }

  /* ==========================================================
   * Utilities
   * ==========================================================
   */

  private sleep(
    milliseconds: number,
  ): Promise<void> {
    return new Promise(
      (
        resolve,
      ) => {
        setTimeout(
          resolve,
          Math.max(
            1,
            milliseconds,
          ),
        );
      },
    );
  }
}

/* ============================================================
 * Factory
 * ============================================================
 */

export function createIndodaxLimiter(
  options?: IndodaxLimiterOptions,
): IndodaxLimiter {
  return new IndodaxLimiter(
    options,
  );
}

/* ============================================================
 * Default Instance
 * ============================================================
 */

export const indodaxLimiter =
  createIndodaxLimiter();

export default indodaxLimiter;
