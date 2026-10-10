import type { ExchangeClient } from "../exchange/exchangeClient";
import type { ExchangeOrder } from "../exchange/exchangeOrder";
import { OrderIdempotency } from "./orderIdempotency";
import { ExecutionReconciler } from "./executionReconciler";

export interface LiveExecutionRequest {
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly quantity: number;
  readonly referencePrice: number;
}

export class LiveOrderExecutor {
  constructor(
    private readonly client: ExchangeClient,
    private readonly idempotency: OrderIdempotency,
    private readonly reconciler: ExecutionReconciler,
    private readonly timeoutMs: number,
  ) {}

  async execute(request: LiveExecutionRequest): Promise<{
    status: "SUBMITTED" | "REJECTED" | "UNKNOWN";
    order?: ExchangeOrder;
    reason?: string;
  }> {
    const clientOrderId = [
      "aura", request.symbol, request.side, Date.now(),
      Math.random().toString(36).slice(2, 10),
    ].join("-");

    if (this.idempotency.has(clientOrderId)) {
      return { status: "REJECTED", reason: "Duplicate order blocked by idempotency" };
    }

    try {
      const order = await this.withTimeout(
        this.client.submitOrder({
          clientOrderId,
          symbol: request.symbol,
          side: request.side,
          quantity: request.quantity,
          type: "MARKET",
        }),
        this.timeoutMs,
      );

      this.idempotency.record(clientOrderId, order.id);

      if (order.status === "UNKNOWN") {
        const reconciled = await this.reconciler.reconcile(order);
        return {
          status: reconciled.status === "UNKNOWN" ? "UNKNOWN" : "SUBMITTED",
          order: reconciled,
        };
      }

      return { status: "SUBMITTED", order };
    } catch (error) {
      // Timeout is UNKNOWN, never an automatic rejection.
      return {
        status: "UNKNOWN",
        reason: error instanceof Error ? error.message : "Unknown execution error",
      };
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timer = setTimeout(() => reject(new Error("Exchange order timeout")), timeoutMs);
        }),
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}
