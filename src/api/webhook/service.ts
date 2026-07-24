import { WebhookPayload } from "./types";

export async function processWebhook(
    payload: WebhookPayload
) {

    return {

        received: true,

        source: payload.source,

        event: payload.event,

        processedAt:
            new Date().toISOString(),

    };

}
