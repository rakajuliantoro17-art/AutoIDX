import { WebhookPayload } from "./types";

export function validateWebhook(
    payload: WebhookPayload
) {

    return (

        payload.source.length > 0 &&

        payload.event.length > 0

    );

}
