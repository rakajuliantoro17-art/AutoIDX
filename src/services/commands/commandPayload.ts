/**
==========================================================
AURA Trade OS
Command Payload
Version : 0.0.7 Alpha
==========================================================
*/

export type CommandPayload =
    Record<string, unknown> |
    readonly unknown[] |
    unknown |
    null;


export function isCommandPayloadObject(
    payload: unknown,
): payload is Record<string, unknown> {
    return (
        typeof payload === "object" &&
        payload !== null &&
        !Array.isArray(payload)
    );
}
