/**
==========================================================
AURA Trade OS
Event Payload
Version : 0.0.7 Alpha
==========================================================
*/

export type EventPayload =
    Record<string, unknown> |
    readonly unknown[] |
    unknown |
    null;

export function isEventPayloadObject(
    payload: unknown,
): payload is Record<string, unknown> {
    return (
        typeof payload === "object" &&
        payload !== null &&
        !Array.isArray(payload)
    );
}
