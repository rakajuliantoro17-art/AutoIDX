/**
==========================================================
AURA Trade OS
Event Metadata
Version : 0.0.7 Alpha
==========================================================
Event Metadata Bag
==========================================================
*/

export interface EventMetadata {

    [key: string]: unknown;

}

export function createEventMetadata(
    data?: Record<string, unknown>,
): EventMetadata {
    return {
        ...data,
    };
}
