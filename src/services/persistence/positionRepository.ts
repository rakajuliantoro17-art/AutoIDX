export interface PersistedPosition {
  readonly symbol: string;

  readonly quantity: number;

  readonly averageEntryPrice: number;

  readonly realizedPnl: number;

  readonly updatedAt: number;

  readonly version: number;
}

export interface PositionRepository {
  get(
    symbol: string,
  ): Promise<PersistedPosition | null>;

  save(
    position: PersistedPosition,
  ): Promise<void>;

  update(
    position: PersistedPosition,
  ): Promise<void>;

  all():
    Promise<readonly PersistedPosition[]>;
}
