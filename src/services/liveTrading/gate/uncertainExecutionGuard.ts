/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 6
 * Uncertain Execution Guard
 * ==========================================================
 */

export interface UncertainExecution {
  readonly key: string;
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly createdAt: number;
  readonly reason: string;
}

export class UncertainExecutionGuard {

  private readonly executions =
    new Map<
      string,
      UncertainExecution
    >();

  markUncertain(
    execution: UncertainExecution,
  ): void {
    this.executions.set(
      execution.key,
      Object.freeze({
        ...execution,
      }),
    );
  }

  isBlocked(
    key: string,
  ): boolean {
    return this.executions.has(key);
  }

  get(
    key: string,
  ): UncertainExecution | undefined {
    return this.executions.get(key);
  }

  resolve(
    key: string,
  ): void {
    this.executions.delete(key);
  }

  clear(): void {
    this.executions.clear();
  }
}
