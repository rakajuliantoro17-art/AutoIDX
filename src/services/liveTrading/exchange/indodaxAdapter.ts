import type { ExchangeClient } from "./exchangeClient";
import type { ExchangeOrder, ExchangeOrderRequest } from "./exchangeOrder";

/**
 * Explicit exchange boundary.
 * Credentials and the current authenticated Indodax API contract must be
 * supplied by the application's exchange infrastructure.
 */
export class IndodaxAdapter implements ExchangeClient {
  async submitOrder(_request: ExchangeOrderRequest): Promise<ExchangeOrder> {
    throw new Error("IndodaxAdapter.submitOrder is not wired. Configure authenticated exchange infrastructure first.");
  }
  async getOrder(_orderId: string, _symbol: string): Promise<ExchangeOrder> {
    throw new Error("IndodaxAdapter.getOrder is not wired. Reconciliation is mandatory before live trading.");
  }
  async cancelOrder(_orderId: string, _symbol: string): Promise<ExchangeOrder> {
    throw new Error("IndodaxAdapter.cancelOrder is not wired.");
  }
  async getBalance(_asset: string): Promise<number> {
    throw new Error("IndodaxAdapter.getBalance is not wired.");
  }
}
