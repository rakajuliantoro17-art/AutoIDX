export type RecoveryState =
  | "NORMAL"
  | "HALTED"
  | "RECONCILING"
  | "MANUAL_REVIEW"
  | "RECOVERED";

export interface RecoverySnapshot {
  readonly state: RecoveryState;

  readonly reason?: string;

  readonly operator?: string;

  readonly timestamp: number;
}
