import type {
  AuditEvent,
} from "./auditEvent";

export interface AuditRepository {
  append(
    event: AuditEvent,
  ): Promise<void>;

  findByExecution(
    executionId: string,
  ): Promise<readonly AuditEvent[]>;

  findByOrder(
    orderId: string,
  ): Promise<readonly AuditEvent[]>;

  findSince(
    timestamp: number,
  ): Promise<readonly AuditEvent[]>;
}
