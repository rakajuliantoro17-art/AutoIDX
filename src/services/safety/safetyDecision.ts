export type SafetyAction =
  | "ALLOW"
  | "HALT"
  | "RECONCILE"
  | "MANUAL_RECOVERY";

export interface SafetyDecision {
  readonly action: SafetyAction;

  readonly safe: boolean;

  readonly reasons: readonly string[];

  readonly timestamp: number;
}
