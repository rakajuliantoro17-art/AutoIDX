/**
==========================================================
AURA Trade OS
Private Trade Service
Version : 0.1.2 Alpha
==========================================================
*/

import type { IExchangeAdapter } from "../adapters/base";
import type {
  Trade,
} from "../models/trade";

export class TradeService {

  constructor(
    private readonly adapter: IExchangeAdapter
  ) {}

  /**
   * Returns one trade.
   */
  async get(
    tradeId: string
  ): Promise<Trade> {
    return this.adapter.getTrade(tradeId);
  }

  /**
   * Returns trade history.
   */
  async history(
    symbol?: string
  ): Promise<Trade[]> {
    return this.adapter.getTradeHistory(symbol);
  }

  /**
   * Returns all trades
   * belonging to one order.
   */
  async byOrder(
    orderId: string
  ): Promise<Trade[]> {
    return this.adapter.getTradesByOrder(orderId);
  }

  /**
   * Returns latest trades.
   */
  async latest(
    limit = 20
  ): Promise<Trade[]> {
    const trades =
      await this.history();
    return trades
      .sort(
        (
          a,
          b
        ) =>
          b.timestamp -
          a.timestamp
      )
      .slice(
        0,
        limit
      );
  }

  /**
   * Returns total fee
   * paid by one order.
   */
  async totalFee(
    orderId: string
  ): Promise<number> {
    const trades =
      await this.byOrder(orderId);
    return trades.reduce(
      (
        total,
        trade
      ) =>
        total + trade.fee,
      0
    );
  }

  /**
   * Returns executed quantity
   * of one order.
   */
  async executedQuantity(
    orderId: string
  ): Promise<number> {
    const trades =
      await this.byOrder(orderId);
    return trades.reduce(
      (
        total,
        trade
      ) =>
        total + trade.quantity,
      0
    );
  }

}

export default TradeService;
