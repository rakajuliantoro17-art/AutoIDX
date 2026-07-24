export interface WebhookPayload {

    source: string;

    event: string;

    data?: unknown;

}
