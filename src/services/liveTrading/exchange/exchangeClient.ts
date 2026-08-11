import type { ExchangeOrder, ExchangeOrderRequest } from "./exchangeOrder";

export interface ExchangeClient {
  submitOrder(request: ExchangeOrderRequest): Promise<ExchangeOrder>;
  getOrder(orderId: string, symbol: string): Promise<ExchangeOrder>;
  cancelOrder(orderId: string, symbol: string): Promise<ExchangeOrder>;
  getBalance(asset: string): Promise<number>;
}
