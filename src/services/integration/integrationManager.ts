import {
  IntegrationError,
} from "./integrationError";

import {
  IntegrationRegistry,
} from "./integrationRegistry";

import type {
  IntegrationCheck,
  IntegrationMode,
  IntegrationOptions,
  IntegrationSnapshot,
} from "./integrationTypes";

export class IntegrationManager {
  private status: IntegrationSnapshot["status"] =
    "IDLE";

  private startedAt: number | null = null;
  private readyAt: number | null = null;

  private checks: IntegrationCheck[] = [];

  constructor(
    private readonly registry: IntegrationRegistry,
    private readonly options: IntegrationOptions = {},
  ) {}

  async initialize(
    mode: IntegrationMode =
      this.options.mode ?? "DEVELOPMENT",
  ): Promise<IntegrationSnapshot> {
    if (
      this.status === "INITIALIZING"
    ) {
      throw new IntegrationError(
        "Integration is already initializing.",
        "INTEGRATION_ALREADY_RUNNING",
      );
    }

    this.status = "INITIALIZING";
    this.startedAt = Date.now();
    this.readyAt = null;
    this.checks = [];

    try {
      for (
        const component of this.registry.list()
      ) {
        await component.initialize?.();

        if (component.validate) {
          const check =
            await component.validate();

          this.checks.push(check);

          if (
            !check.passed &&
            check.critical &&
            (
              this.options.failFast ??
              true
            )
          ) {
            throw new IntegrationError(
              check.message ??
                `Critical integration check failed: ${check.name}`,
              "CRITICAL_INTEGRATION_CHECK_FAILED",
            );
          }
        }
      }

      const criticalFailures =
        this.checks.filter(
          (check) =>
            check.critical &&
            !check.passed,
        );

      if (
        this.options.requireAllCriticalChecks &&
        criticalFailures.length > 0
      ) {
        this.status = "FAILED";

        throw new IntegrationError(
          "One or more critical integration checks failed.",
          "CRITICAL_CHECKS_FAILED",
        );
      }

      this.status =
        criticalFailures.length > 0
          ? "DEGRADED"
          : "READY";

      this.readyAt =
        this.status === "READY"
          ? Date.now()
          : null;

      return this.snapshot(mode);
    } catch (error) {
      this.status = "FAILED";

      throw error;
    }
  }

  async shutdown(): Promise<void> {
    const components =
      [...this.registry.list()].reverse();

    for (const component of components) {
      await component.shutdown?.();
    }

    this.status = "HALTED";
  }

  snapshot(
    mode: IntegrationMode =
      this.options.mode ?? "DEVELOPMENT",
  ): IntegrationSnapshot {
    return Object.freeze({
      status: this.status,
      mode,
      startedAt: this.startedAt,
      readyAt: this.readyAt,
      checks: Object.freeze([
        ...this.checks,
      ]),
    });
  }

  isReady(): boolean {
    return this.status === "READY";
  }
}
