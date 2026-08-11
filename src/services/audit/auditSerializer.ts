import type {
  AuditEvent,
} from "./auditEvent";

export class AuditSerializer {
  serialize(
    event: AuditEvent,
  ): string {
    return JSON.stringify(event);
  }

  deserialize(
    payload: string,
  ): AuditEvent {

    const parsed =
      JSON.parse(payload) as AuditEvent;

    if (
      !parsed.id ||
      !parsed.type ||
      !parsed.timestamp ||
      !parsed.message
    ) {
      throw new Error(
        "Invalid audit event",
      );
    }

    return Object.freeze(parsed);
  }
}
