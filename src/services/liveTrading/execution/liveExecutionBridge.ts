/**
 * ==========================================================
 * AutoIDX — Live Execution Bridge
 * Phase 38 / Batch 3
 * ==========================================================
 *
 * This class deliberately accepts a generic executor.
 *
 * WHY:
 * The repository already has a LiveOrderExecutor.
 * We should not duplicate or replace its contract.
 * ==========================================================
 */
import {
  CanaryContext,
} from "../canary/canaryContext";
import {
  CanaryManager,
} from "../canary/canaryManager";
import {
  CanaryExecutionService,
} from "../canary/canaryExecutionService";
import {
  CanaryDecision,
} from "../canary/canaryDecision";

export interface LiveExecutionBridgeRequest<TOrder> {
  context: CanaryContext;
  order: TOrder;
}

export interface LiveExecutionResult<TResult> {
  decision: CanaryDecision;
  executionAllowed: boolean;
  result?: TResult;
  error?: unknown;
}

export class LiveExecutionBridge<TOrder, TResult> {
  private readonly service: CanaryExecutionService<TOrder, TResult>;

  public constructor(
    canaryManager: CanaryManager,
    executor: (order: TOrder) => Promise<TResult>,
  ) {
    this.service = new CanaryExecutionService(canaryManager, executor);
  }

  public async execute(
    request: LiveExecutionBridgeRequest<TOrder>,
  ): Promise<LiveExecutionResult<TResult>> {
    const result = await this.service.execute({
      context: request.context,
      order: request.order,
    });

    return {
      decision: result.decision,
      executionAllowed: result.executed,
      result: result.result,
      error: result.error,
    };
  }
}
