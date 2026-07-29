/**
==========================================================
AURA Trade OS
Private Order Service
Version : 0.1.2 Alpha
==========================================================
*/

import type { IExchangeAdapter } from "../adapters/base";
import type {
  Order,
  OrderStatus,
} from "../models/order";

export class OrderService {

  constructor(
    private readonly adapter: IExchangeAdapter
  ) {}

  /**
   * Places a new order.
   */
  async place(
    order: Order
  ): Promise<Order> {
    return this.adapter.placeOrder(order);
  }

  /**
   * Returns one order.
   */
  async get(
    orderId: string
  ): Promise<Order> {
    return this.adapter.getOrder(orderId);
  }

  /**
   * Returns all open orders.
   */
  async getOpen(): Promise<Order[]> {
    return this.adapter.getOpenOrders();
  }

  /**
   * Returns order history.
   */
  async history(
    symbol?: string
  ): Promise<Order[]> {
    return this.adapter.getOrderHistory(symbol);
  }

  /**
   * Cancels one order.
   */
  async cancel(
    orderId: string
  ): Promise<boolean> {
    return this.adapter.cancelOrder(orderId);
  }

  /**
   * Cancels all open orders.
   */
  async cancelAll(
    symbol?: string
  ): Promise<number> {
    return this.adapter.cancelAllOrders(symbol);
  }

  /**
   * Checks whether
   * an order is active.
   */
  async isOpen(
    orderId: string
  ): Promise<boolean> {
    const order =
      await this.get(orderId);
    return (
      order.status === "NEW"
      ||
      order.status === "OPEN"
      ||
      order.status === "PARTIALLY_FILLED"
    );
  }

  /**
   * Returns current status.
   */
  async status(
    orderId: string
  ): Promise<OrderStatus> {
    const order =
      await this.get(orderId);
    return order.status;
  }

}

export default OrderService;
