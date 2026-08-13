/**
 * ============================================================
 * AURA Trade OS
 * Trading Integration
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Menyatukan strategy/risk/safety dengan trading execution.
 * - Menjadi boundary sebelum live order dikirim.
 * - Tidak mengimplementasikan strategy atau exchange client baru.
 * - Menjaga execution flow tetap terkontrol.
 *
 * IMPORTANT:
 * TradingIntegration tidak boleh melewati risk/safety layer.
 * ============================================================
 */

export type TradingSide = "BUY" | "SELL";

export type TradingMode =
  | "PAPER"
  | "CANARY"
  | "LIVE";

export type TradingIntegrationStatus =
  | "IDLE"
  | "READY"
  | "EXECUTING"
  | "COMPLETED"
  | "REJECTED"
  | "FAILED";

export interface TradingIntegrationRequest {
  symbol: string;
  side: TradingSide;
  amount: number;

  /**
   * Optional price.
   * Required by some execution implementations,
   * but intentionally optional here.
   */
  price?: number;

  confidence?: number;

  mode?: TradingMode;

  /**
   * Unique request identifier.
   * Used for idempotency and tracing.
   */
  requestId?: string;

  metadata?: Record<string, unknown>;
}

export interface TradingIntegrationResult {
  success: boolean;

  status: TradingIntegrationStatus;

  requestId: string;

  symbol: string;

  side: TradingSide;

  amount: number;

  orderId?: string;

  executedAmount?: number;

  executedPrice?: number;

  error?: string;

  timestamp: number;

  metadata?: Record<string, unknown>;
}

export interface TradingExecutionAdapter {
  execute(
    request: TradingIntegrationRequest,
  ): Promise<TradingIntegrationResult>;
}

export interface TradingRiskAdapter {
  validate(
    request: TradingIntegrationRequest,
  ): Promise<boolean> | boolean;
}

export interface TradingSafetyAdapter {
  validate(
    request: TradingIntegrationRequest,
  ): Promise<boolean> | boolean;
}

export interface TradingIntegrationOptions {
  execution: TradingExecutionAdapter;

  risk?: TradingRiskAdapter;

  safety?: TradingSafetyAdapter;

  mode?: TradingMode;
}

export class TradingIntegration {

  public readonly name = "trading-integration";

  private readonly execution: TradingExecutionAdapter;

  private readonly risk?: TradingRiskAdapter;

  private readonly safety?: TradingSafetyAdapter;

  private readonly mode: TradingMode;

  private readonly processedRequests = new Set<string>();

  private readonly execution: TradingExecutionAdapter;

  private readonly risk?: TradingRiskAdapter;

  private readonly safety?: TradingSafetyAdapter;

  private readonly mode: TradingMode;

  private readonly processedRequests = new Set<string>();

  public constructor(
    options: TradingIntegrationOptions,
  ) {
    this.execution = options.execution;
    this.risk = options.risk;
    this.safety = options.safety;
    this.mode = options.mode ?? "PAPER";
  }

  /**
   * Execute a trading request through the complete
   * integration boundary.
   *
   * Flow:
   *
   * Request
   *   ↓
   * Validation
   *   ↓
   * Risk
   *   ↓
   * Safety
   *   ↓
   * Execution
   */
  public async execute(
    request: TradingIntegrationRequest,
  ): Promise<TradingIntegrationResult> {
    const requestId =
      request.requestId ??
      this.generateRequestId();

    const normalizedRequest: TradingIntegrationRequest = {
      ...request,
      requestId,
      mode: request.mode ?? this.mode,
    };

    const validationError =
      this.validateRequest(normalizedRequest);

    if (validationError) {
      return this.rejectedResult(
        normalizedRequest,
        validationError,
      );
    }

    /**
     * Idempotency protection.
     *
     * A request must never be submitted twice
     * through the same integration instance.
     */
    if (this.processedRequests.has(requestId)) {
      return this.rejectedResult(
        normalizedRequest,
        "Duplicate trading request",
      );
    }

    /**
     * Risk validation must happen before execution.
     */
    if (this.risk) {
      const riskAllowed =
        await this.risk.validate(
          normalizedRequest,
        );

      if (!riskAllowed) {
        return this.rejectedResult(
          normalizedRequest,
          "Trading request rejected by risk layer",
        );
      }
    }

    /**
     * Safety validation must happen after risk
     * and before execution.
     */
    if (this.safety) {
      const safetyAllowed =
        await this.safety.validate(
          normalizedRequest,
        );

      if (!safetyAllowed) {
        return this.rejectedResult(
          normalizedRequest,
          "Trading request rejected by safety layer",
        );
      }
    }

    this.processedRequests.add(requestId);

    try {
      const result =
        await this.execution.execute(
          normalizedRequest,
        );

      return {
        ...result,
        requestId,
        symbol: normalizedRequest.symbol,
        side: normalizedRequest.side,
        amount: normalizedRequest.amount,
        timestamp:
          result.timestamp || Date.now(),
      };
    } catch (error: unknown) {
      return {
        success: false,
        status: "FAILED",
        requestId,
        symbol: normalizedRequest.symbol,
        side: normalizedRequest.side,
        amount: normalizedRequest.amount,
        timestamp: Date.now(),
        error: this.normalizeError(error),
      };
    }
  }

  /**
   * Convenience BUY method.
   */
  public async buy(
    symbol: string,
    amount: number,
    options?: Omit<
      TradingIntegrationRequest,
      "symbol" | "side" | "amount"
    >,
  ): Promise<TradingIntegrationResult> {
    return this.execute({
      ...options,
      symbol,
      side: "BUY",
      amount,
    });
  }

  /**
   * Convenience SELL method.
   */
  public async sell(
    symbol: string,
    amount: number,
    options?: Omit<
      TradingIntegrationRequest,
      "symbol" | "side" | "amount"
    >,
  ): Promise<TradingIntegrationResult> {
    return this.execute({
      ...options,
      symbol,
      side: "SELL",
      amount,
    });
  }

  /**
   * Current configured trading mode.
   */
  public getMode(): TradingMode {
    return this.mode;
  }

  /**
   * Clear local idempotency state.
   *
   * Intended for lifecycle/recovery handling.
   */
  public clearProcessedRequests(): void {
    this.processedRequests.clear();
  }

  private validateRequest(
    request: TradingIntegrationRequest,
  ): string | null {
    if (!request.symbol.trim()) {
      return "Trading symbol is required";
    }

    if (!Number.isFinite(request.amount)) {
      return "Trading amount must be a finite number";
    }

    if (request.amount <= 0) {
      return "Trading amount must be greater than zero";
    }

    if (
      request.price !== undefined &&
      (
        !Number.isFinite(request.price) ||
        request.price <= 0
      )
    ) {
      return "Trading price must be greater than zero";
    }

    if (
      request.confidence !== undefined &&
      (
        !Number.isFinite(request.confidence) ||
        request.confidence < 0 ||
        request.confidence > 1
      )
    ) {
      return "Trading confidence must be between 0 and 1";
    }

    return null;
  }

  private rejectedResult(
    request: TradingIntegrationRequest,
    error: string,
  ): TradingIntegrationResult {
    return {
      success: false,
      status: "REJECTED",
      requestId:
        request.requestId ??
        this.generateRequestId(),
      symbol: request.symbol,
      side: request.side,
      amount: request.amount,
      timestamp: Date.now(),
      error,
    };
  }

  private generateRequestId(): string {
    return `trade-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}`;
  }

  private normalizeError(
    error: unknown,
  ): string {
    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === "string") {
      return error;
    }

    try {
      return JSON.stringify(error);
    } catch {
      return "Unknown trading integration error";
    }
  }
}

export default TradingIntegration;
