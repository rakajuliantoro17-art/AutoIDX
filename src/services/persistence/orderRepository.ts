export interface PersistedOrder {
  readonly exchangeOrderId: string;

  readonly clientOrderId: string;

  readonly symbol: string;

  readonly side: "BUY" | "SELL";

  readonly status: string;

  readonly quantity: number;

  readonly filledQuantity: number;

  readonly averagePrice?: number;

  readonly updatedAt: number;
}

export interface OrderRepository {
  get(
    exchangeOrderId: string,
  ): Promise<PersistedOrder | null>;

  save(
    order: PersistedOrder,
  ): Promise<void>;

  update(
    order: PersistedOrder,
  ): Promise<void>;

  findOpen():
    Promise<readonly PersistedOrder[]>;
}
