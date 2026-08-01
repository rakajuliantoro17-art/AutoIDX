/**
==========================================================
AURA Trade OS
Execution Manager
Version : 0.1.1 Alpha
==========================================================
*/

import { ExecutionEngine } from "./executionEngine";
import executionLogger from "./executionLogger";

import type {
  ExecutionRequest,
  ExecutionResult,
  ExecutionAdapter,
  ExecutionContext,
} from "./types";

export class ExecutionManager {

  private readonly engine: ExecutionEngine;

  constructor(adapter: ExecutionAdapter) {
    this.engine = new ExecutionEngine({ adapter });
  }

  /**
   * Execute trading request.
   */
  async execute(
    request: ExecutionRequest,
    context: ExecutionContext
  ): Promise<ExecutionResult> {

    const result = await this.engine.execute(request, context);

    executionLogger.log(request, result);

    return result;

  }

  /**
   * Latest execution log.
   */
  latest() {
    return executionLogger.latest();
  }

  /**
   * All execution logs.
   */
  history() {
    return executionLogger.getLogs();
  }

  /**
   * Total execution count.
   */
  totalExecutions(): number {
    return executionLogger.count();
  }

  /**
   * Clear execution history.
   */
  clearHistory(): void {
    executionLogger.clear();
  }

}

export default ExecutionManager;
