export interface WebhookPayload {

    source: string;

    event: string;

    data?: unknown;

    /**
     * Opsional -- dipakai metode verifikasi body-embedded secret
     * (signature.ts: verifyEmbeddedSecret) untuk source yang tidak
     * bisa kirim header custom (mis. TradingView Alert). Kalau
     * source-nya bisa kirim header (X-Webhook-Signature), field ini
     * tidak perlu diisi.
     */
    secret?: string;

}
