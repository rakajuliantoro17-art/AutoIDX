/**
 * ============================================================
 * AURA Trade OS
 * Risk Integration
 * ============================================================
 *
 * Phase 38 - Integration / Fix
 *
 * Responsibility:
 * - Menjadi boundary antara trading flow dan Risk Layer.
 * - Menormalisasi request risk.
 * - Menjalankan validasi risk sebelum execution.
 * - Tidak mengimplementasikan Risk Engine baru.
 * - Tidak boleh melewati Safety Layer / Risk Manager.
 *
 * Trading flow:
 *
 * Strategy
 *    ↓
 * Risk Integration
 *    ↓
 * Risk Engine
 *    ↓
 * Safety
 *    ↓
 * Execution
 * ============================================================
 */

export type RiskSide = "BUY" | "SELL";

export type RiskDecision =
  | "ALLOW"
  | "REJECT"
  | "BLOCK";

export type RiskSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface RiskIntegrationRequest {
  symbol: string;
  side: RiskSide;
  amount: number;

  price?: number;

  confidence?: number;

  balance?: number;

  exposure?: number;

  maxExposure?: number;

  positionSize?: number;

  maxPositionSize?: number;

  dailyLoss?: number;

  maxDailyLoss?: number;

  metadata?: Record<string, unknown>;
}

export interface RiskIntegrationResult {
  allowed: boolean;

  decision: RiskDecision;

  severity: RiskSeverity;

  reason?: string;

  symbol: string;

  side: RiskSide;

  amount: number;

  timestamp: number;

  metadata?: Record<string, unknown>;
}

export interface RiskEngineAdapter {
  evaluate(
    request: RiskIntegrationRequest,
  ):
    | RiskIntegrationResult
    | Promise<RiskIntegrationResult>;
}

export interface RiskIntegrationOptions {
  engine?: RiskEngineAdapter;

  minimumConfidence?: number;

  maxOrderAmount?: number;

  enforceBalanceCheck?: boolean;

  enforceExposureCheck?: boolean;

  enforcePositionLimit?: boolean;

  enforceDailyLossLimit?: boolean;
}

export class RiskIntegration {
  private readonly engine?: RiskEngineAdapter;

  private readonly minimumConfidence?: number;

  private readonly maxOrderAmount?: number;

  private readonly enforceBalanceCheck: boolean;

  private readonly enforceExposureCheck: boolean;

  private readonly enforcePositionLimit: boolean;

  private readonly enforceDailyLossLimit: boolean;

  public constructor(
    options: RiskIntegrationOptions = {},
  ) {
    this.engine = options.engine;

    this.minimumConfidence =
      options.minimumConfidence;

    this.maxOrderAmount =
      options.maxOrderAmount;

    this.enforceBalanceCheck =
      options.enforceBalanceCheck ?? true;

    this.enforceExposureCheck =
      options.enforceExposureCheck ?? true;

    this.enforcePositionLimit =
      options.enforcePositionLimit ?? true;

    this.enforceDailyLossLimit =
      options.enforceDailyLossLimit ?? true;
  }

  /**
   * Main risk evaluation entry point.
   *
   * Local validation is performed first.
   * The existing Risk Engine is then called when available.
   */
  public async evaluate(
    request: RiskIntegrationRequest,
  ): Promise<RiskIntegrationResult> {
    const validationError =
      this.validateRequest(request);

    if (validationError) {
      return this.reject(
        request,
        validationError,
        "HIGH",
      );
    }

    const localDecision =
      this.evaluateLocalRules(request);

    if (!localDecision.allowed) {
      return localDecision;
    }

    /**
     * Delegate to the existing Risk Engine.
     *
     * This integration layer must never replace
     * the domain risk engine.
     */
    if (this.engine) {
      try {
        const result =
          await this.engine.evaluate(request);

        return {
          ...result,
          symbol: request.symbol,
          side: request.side,
          amount: request.amount,
          timestamp:
            result.timestamp || Date.now(),
        };
      } catch (error: unknown) {
        /**
         * Fail closed.
         *
         * If the Risk Engine cannot be reached,
         * the trade must not continue to execution.
         */
        return this.reject(
          request,
          this.normalizeError(error),
          "CRITICAL",
        );
      }
    }

    /**
     * If no external engine is configured,
     * local validation is the final decision.
     *
     * This is intentionally conservative.
     */
    return {
      allowed: true,
      decision: "ALLOW",
      severity: "LOW",
      symbol: request.symbol,
      side: request.side,
      amount: request.amount,
      timestamp: Date.now(),
    };
  }

  /**
   * Alias used by integration callers that expect
   * a validate-style API.
   */
  public async validate(
    request: RiskIntegrationRequest,
  ): Promise<boolean> {
    const result =
      await this.evaluate(request);

    return result.allowed;
  }

  /**
   * Convenience BUY evaluation.
   */
  public async evaluateBuy(
    symbol: string,
    amount: number,
    options?: Omit<
      RiskIntegrationRequest,
      "symbol" | "side" | "amount"
    >,
  ): Promise<RiskIntegrationResult> {
    return this.evaluate({
      ...options,
      symbol,
      side: "BUY",
      amount,
    });
  }

  /**
   * Convenience SELL evaluation.
   */
  public async evaluateSell(
    symbol: string,
    amount: number,
    options?: Omit<
      RiskIntegrationRequest,
      "symbol" | "side" | "amount"
    >,
  ): Promise<RiskIntegrationResult> {
    return this.evaluate({
      ...options,
      symbol,
      side: "SELL",
      amount,
    });
  }

  /**
   * Local safety-oriented risk rules.
   *
   * These are integration guards only.
   * Domain-specific risk calculations remain
   * inside the actual Risk Engine.
   */
  private evaluateLocalRules(
    request: RiskIntegrationRequest,
  ): RiskIntegrationResult {
    if (
      this.minimumConfidence !== undefined &&
      request.confidence !== undefined &&
      request.confidence <
        this.minimumConfidence
    ) {
      return this.reject(
        request,
        "Confidence below minimum risk threshold",
        "MEDIUM",
      );
    }

    if (
      this.maxOrderAmount !== undefined &&
      request.amount >
        this.maxOrderAmount
    ) {
      return this.reject(
        request,
        "Order amount exceeds maximum allowed amount",
        "HIGH",
      );
    }

    if (
      this.enforceBalanceCheck &&
      request.side === "BUY" &&
      request.balance !== undefined &&
      request.price !== undefined
    ) {
      const requiredBalance =
        request.amount * request.price;

      if (
        requiredBalance >
        request.balance
      ) {
        return this.reject(
          request,
          "Insufficient balance",
          "HIGH",
        );
      }
    }

    if (
      this.enforceExposureCheck &&
      request.exposure !== undefined &&
      request.maxExposure !== undefined &&
      request.exposure >
        request.maxExposure
    ) {
      return this.reject(
        request,
        "Maximum exposure exceeded",
        "HIGH",
      );
    }

    if (
      this.enforcePositionLimit &&
      request.positionSize !== undefined &&
      request.maxPositionSize !== undefined &&
      request.positionSize >
        request.maxPositionSize
    ) {
      return this.reject(
        request,
        "Maximum position limit exceeded",
        "HIGH",
      );
    }

    if (
      this.enforceDailyLossLimit &&
      request.dailyLoss !== undefined &&
      request.maxDailyLoss !== undefined &&
      request.dailyLoss >=
        request.maxDailyLoss
    ) {
      return this.reject(
        request,
        "Daily loss limit reached",
        "CRITICAL",
      );
    }

    return {
      allowed: true,
      decision: "ALLOW",
      severity: "LOW",
      symbol: request.symbol,
      side: request.side,
      amount: request.amount,
      timestamp: Date.now(),
    };
  }

  private validateRequest(
    request: RiskIntegrationRequest,
  ): string | null {
    if (!request) {
      return "Risk request is required";
    }

    if (
      typeof request.symbol !== "string" ||
      !request.symbol.trim()
    ) {
      return "Trading symbol is required";
    }

    if (
      request.side !== "BUY" &&
      request.side !== "SELL"
    ) {
      return "Invalid trading side";
    }

    if (
      !Number.isFinite(request.amount) ||
      request.amount <= 0
    ) {
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
      return "Confidence must be between 0 and 1";
    }

    if (
      request.balance !== undefined &&
      (
        !Number.isFinite(request.balance) ||
        request.balance < 0
      )
    ) {
      return "Balance must be a non-negative number";
    }

    if (
      request.exposure !== undefined &&
      !Number.isFinite(request.exposure)
    ) {
      return "Exposure must be a finite number";
    }

    if (
      request.maxExposure !== undefined &&
      (
        !Number.isFinite(request.maxExposure) ||
        request.maxExposure < 0
      )
    ) {
      return "Maximum exposure must be a non-negative number";
    }

    if (
      request.dailyLoss !== undefined &&
      !Number.isFinite(request.dailyLoss)
    ) {
      return "Daily loss must be a finite number";
    }

    if (
      request.maxDailyLoss !== undefined &&
      (
        !Number.isFinite(request.maxDailyLoss) ||
        request.maxDailyLoss < 0
      )
    ) {
      return "Maximum daily loss must be a non-negative number";
    }

    return null;
  }

  private reject(
    request: RiskIntegrationRequest,
    reason: string,
    severity: RiskSeverity,
  ): RiskIntegrationResult {
    return {
      allowed: false,
      decision:
        severity === "CRITICAL"
          ? "BLOCK"
          : "REJECT",
      severity,
      reason,
      symbol: request.symbol,
      side: request.side,
      amount: request.amount,
      timestamp: Date.now(),
    };
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
      const serialized =
        JSON.stringify(error);

      return (
        serialized ||
        "Unknown risk engine error"
      );
    } catch {
      return "Unknown risk engine error";
    }
  }
}

export default RiskIntegration;
