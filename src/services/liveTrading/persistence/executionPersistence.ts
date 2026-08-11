/**
 * ==========================================================
 * AutoIDX — Execution Persistence Adapter
 * Phase 38 / Batch 4
 * ==========================================================
 */

export interface PersistedExecution {
  readonly localOrderId: string;

  readonly exchangeOrderId?: string;

  readonly status: string;

  readonly executed?: number;

  readonly remaining?: number;

  readonly createdAt: number;

  readonly updatedAt: number;

  readonly metadata?: Record<
    string,
    unknown
  >;
}

export interface ExecutionPersistenceStore {
  save(
    execution: PersistedExecution,
  ): Promise<void>;

  findByLocalOrderId(
    localOrderId: string,
  ): Promise<
    PersistedExecution | undefined
  >;

  findByExchangeOrderId(
    exchangeOrderId: string,
  ): Promise<
    PersistedExecution | undefined
  >;
}

export class ExecutionPersistence {
  public constructor(
    private readonly store:
      ExecutionPersistenceStore,
  ) {}

  public async save(
    execution: PersistedExecution,
  ): Promise<void> {
    await this.store.save(
      execution,
    );
  }

  public async find(
    localOrderId: string,
  ): Promise<
    PersistedExecution | undefined
  > {
    return this.store.findByLocalOrderId(
      localOrderId,
    );
  }

  public async findByExchangeOrderId(
    exchangeOrderId: string,
  ): Promise<
    PersistedExecution | undefined
  > {
    return this.store.findByExchangeOrderId(
      exchangeOrderId,
    );
  }
}
