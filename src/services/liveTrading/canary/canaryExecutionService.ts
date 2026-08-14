/**
 * ==========================================================
 * AutoIDX — Canary Execution Service
 * Phase 38 / Batch 3
 * ==========================================================
 *
 * RESPONSIBILITY:
 * - Evaluate CanaryGate.
 * - Refuse execution when canary is not approved.
 * - Forward approved requests to the supplied executor.
 *
 * SECURITY:
 * - This class does NOT bypass Safety/Risk.
 * - Canary approval is NOT equivalent to risk approval.
 * - Executor errors are propagated.
 * ==========================================================
 */

import {
  CanaryContext,
} from "./canaryContext";

import {
  CanaryManager,
} from "./canaryManager";

import {
  CanaryDecision,
} from "./canaryDecision";

export interface CanaryExecutionRequest<TOrder> {
  context: CanaryContext;

  order: TOrder;
}

export interface CanaryExecutionResult<T> {
  decision: CanaryDecision;

  executed: boolean;

  result?: T;

  error?: unknown;
}

export type CanaryExecutorFn<TOrder, TResult> =
  (
    order: TOrder,
  ) => Promise<TResult>;

export class CanaryExecutionService<
  TOrder,
  TResult,
> {
  public constructor(
    private readonly canaryManager:
      CanaryManager,

    private readonly executor:
      CanaryExecutorFn
        TOrder,
        TResult
      >,
  ) {}

  public async execute(
    request:
      CanaryExecutionRequest<TOrder>,
  ): Promise<
    CanaryExecutionResult<TResult>
  > {
    const decision =
      this.canaryManager.evaluate(
        request.context,
      );

    if (!decision.approved) {
      return {
        decision,

        executed: false,
      };
    }

    try {
      const result =
        await this.executor(
          request.order,
        );

      this.canaryManager.recordOrder(
        request.context.orderValueIdr,
      );

      return {
        decision,

        executed: true,

        result,
      };
    } catch (error) {
      return {
        decision,

        executed: false,

        error,
      };
    }
  }
}
