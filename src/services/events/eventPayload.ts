/**
==========================================================
AURA Trade OS
Event Payload
Version : 0.0.7 Alpha
==========================================================
Event Payload Contract
==========================================================
*/

export type EventPayload =
    Record<string, unknown> | null;

export function isEventPayloadObject(
    value: EventPayload,
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null
    );
}
