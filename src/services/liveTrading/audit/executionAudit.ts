/**
 * ==========================================================
 * AutoIDX — Execution Audit
 * Phase 38 / Batch 4
 * ==========================================================
 */

export type ExecutionAuditAction =
  | "ORDER_CREATED"
  | "ORDER_VALIDATED"
  | "CANARY_APPROVED"
  | "CANARY_REJECTED"
  | "ORDER_SUBMITTED"
  | "ORDER_FILLED"
  | "ORDER_PARTIAL"
  | "ORDER_CANCELLED"
  | "ORDER_REJECTED"
  | "RECONCILIATION_MATCHED"
  | "RECONCILIATION_PARTIAL"
  | "RECONCILIATION_MISMATCH"
  | "RECONCILIATION_UNKNOWN"
  | "EXECUTION_FAILED";

export interface ExecutionAuditEvent {
  readonly eventId: string;

  readonly action:
    ExecutionAuditAction;

  readonly localOrderId: string;

  readonly exchangeOrderId?: string;

  readonly timestamp: number;

  readonly metadata?: Record<
    string,
    unknown
  >;
}

export interface ExecutionAuditSink {
  write(
    event: ExecutionAuditEvent,
  ): Promise<void>;
}

const createEventId = (): string =>
  `exec_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;

export class ExecutionAudit {
  public constructor(
    private readonly sink:
      ExecutionAuditSink,
  ) {}

  public async record(
    action: ExecutionAuditAction,
    localOrderId: string,
    options?: {
      exchangeOrderId?: string;

      metadata?: Record<
        string,
        unknown
      >;
    },
  ): Promise<void> {
    const event:
      ExecutionAuditEvent = {
        eventId:
          createEventId(),

        action,

        localOrderId,

        exchangeOrderId:
          options?.exchangeOrderId,

        timestamp:
          Date.now(),

        metadata:
          options?.metadata,
      };

    await this.sink.write(
      event,
    );
  }
}
