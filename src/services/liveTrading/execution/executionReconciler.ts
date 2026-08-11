import type { ExchangeClient } from "../exchange/exchangeClient";
import type { ExchangeOrder } from "../exchange/exchangeOrder";

export class ExecutionReconciler {
  constructor(private readonly client: ExchangeClient) {}

  async reconcile(order: ExchangeOrder): Promise<ExchangeOrder> {
    if (!order.id) throw new Error("Cannot reconcile order without exchange id");
    return this.client.getOrder(order.id, order.symbol);
  }

  isTerminal(order: ExchangeOrder): boolean {
    return ["FILLED", "CANCELLED", "REJECTED"].includes(order.status);
  }

  isUnknown(order: ExchangeOrder): boolean {
    return order.status === "UNKNOWN";
  }
}
