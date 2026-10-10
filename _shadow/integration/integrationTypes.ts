export type IntegrationStatus =
  | "IDLE"
  | "INITIALIZING"
  | "READY"
  | "DEGRADED"
  | "HALTED"
  | "FAILED";

export type IntegrationMode =
  | "DEVELOPMENT"
  | "PAPER"
  | "LIVE";

export interface IntegrationCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly critical: boolean;
  readonly message?: string;
  readonly durationMs?: number;
}

export interface IntegrationSnapshot {
  readonly status: IntegrationStatus;
  readonly mode: IntegrationMode;
  readonly startedAt: number | null;
  readonly readyAt: number | null;
  readonly checks: readonly IntegrationCheck[];
}

export interface IntegrationOptions {
  readonly mode?: IntegrationMode;
  readonly failFast?: boolean;
  readonly requireAllCriticalChecks?: boolean;
}

export interface IntegrationComponent {
  readonly name: string;
  initialize?(): Promise<void> | void;
  validate?(): Promise<IntegrationCheck> | IntegrationCheck;
  shutdown?(): Promise<void> | void;
}
