import type {
  AuditEvent,
  AuditEventType,
} from "./auditEvent";

export interface AuditSink {
  write(
    event: AuditEvent,
  ): Promise<void>;
}

export class AuditLogger {
  constructor(
    private readonly sink: AuditSink,
  ) {}

  async log(
    type: AuditEventType,
    message: string,
    fields: {
      executionId?: string;
      signalId?: string;
      orderId?: string;
      symbol?: string;
      metadata?:
        Readonly<Record<string, unknown>>;
    } = {},
  ): Promise<AuditEvent> {

    const event: AuditEvent =
      Object.freeze({
        id:
          `audit-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 10)}`,

        type,

        timestamp: Date.now(),

        message,

        ...fields,
      });

    await this.sink.write(event);

    return event;
  }
}
