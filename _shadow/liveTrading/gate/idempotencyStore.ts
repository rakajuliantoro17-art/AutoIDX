/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 6
 * Idempotency Store
 * ==========================================================
 */

export type IdempotencyStatus =
  | "RESERVED"
  | "SUBMITTED"
  | "COMPLETED"
  | "FAILED"
  | "UNCERTAIN";

export interface IdempotencyRecord {
  readonly key: string;
  readonly orderId?: string;
  readonly status: IdempotencyStatus;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly metadata?: Record<string, unknown>;
}

export interface IdempotencyStore {
  get(
    key: string,
  ): Promise<
    IdempotencyRecord | undefined
  >;

  put(
    record: IdempotencyRecord,
  ): Promise<void>;

  update(
    key: string,
    patch: Partial<IdempotencyRecord>,
  ): Promise<void>;
}

/**
 * Development-only in-memory implementation.
 *
 * Production MUST use a durable store.
 */
export class MemoryIdempotencyStore
  implements IdempotencyStore {

  private readonly records =
    new Map<
      string,
      IdempotencyRecord
    >();

  async get(
    key: string,
  ): Promise<
    IdempotencyRecord | undefined
  > {
    return this.records.get(key);
  }

  async put(
    record: IdempotencyRecord,
  ): Promise<void> {
    if (
      this.records.has(record.key)
    ) {
      throw new Error(
        `Idempotency key already exists: ${record.key}`,
      );
    }

    this.records.set(
      record.key,
      Object.freeze({
        ...record,
      }),
    );
  }

  async update(
    key: string,
    patch: Partial<IdempotencyRecord>,
  ): Promise<void> {
    const current =
      this.records.get(key);

    if (!current) {
      throw new Error(
        `Idempotency record not found: ${key}`,
      );
    }

    this.records.set(
      key,
      Object.freeze({
        ...current,
        ...patch,
        updatedAt: Date.now(),
      }),
    );
  }
}
