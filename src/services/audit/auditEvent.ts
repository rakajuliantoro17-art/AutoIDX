export type AuditEventType =
  | "SIGNAL_RECEIVED"
  | "RISK_APPROVED"
  | "ORDER_REQUESTED"
  | "ORDER_SUBMITTED"
  | "ORDER_UNKNOWN"
  | "ORDER_RECONCILED"
  | "ORDER_FILLED"
  | "ORDER_PARTIAL"
  | "ORDER_CANCELLED"
  | "ORDER_REJECTED"
  | "BALANCE_MISMATCH"
  | "POSITION_MISMATCH"
  | "SAFETY_HALT"
  | "MANUAL_RECOVERY"
  | "KILL_SWITCH";

export interface AuditEvent {
  readonly id: string;

  readonly type: AuditEventType;

  readonly timestamp: number;

  readonly executionId?: string;

  readonly signalId?: string;

  readonly orderId?: string;

  readonly symbol?: string;

  readonly message: string;

  readonly metadata?:
    Readonly<Record<string, unknown>>;
}
