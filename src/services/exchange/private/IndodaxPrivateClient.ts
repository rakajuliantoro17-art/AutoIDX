/**
==========================================================
AURA Trade OS
Indodax Private HTTP Client
Version : 0.1.0 Alpha

Client untuk Indodax Trade API (private/signed endpoints).
Base URL & skema auth mengikuti dokumentasi resmi:
https://github.com/btcid/indodax-official-api-docs

Berbeda dari IndodaxPublicClient (services/exchange/public/client.ts):
client ini BUKAN singleton — satu instance terikat ke SATU
kredensial (satu akun Indodax), karena satu user AURA Trade OS
bisa punya banyak akun Indodax. Instance dibuat per akun oleh
IndodaxAdapterFactory, tidak diekspor sebagai default singleton.
==========================================================
*/
import { RequestSigner } from "../auth/RequestSigner";
import { AuthenticationError } from "../errors/AuthenticationError";
import { ExchangeError } from "../errors/ExchangeError";
import { NetworkError } from "../errors/NetworkError";
import { RateLimitError } from "../errors/RateLimitError";

export interface IndodaxCredentials {
  apiKey: string;
  secretKey: string;
}

export interface IndodaxPrivateClientOptions {
  baseUrl?: string;
  timeout?: number;
  recvWindow?: number;
}

interface IndodaxRawResponse<T> {
  success: 0 | 1;
  return?: T;
  error?: string;
  error_code?: string;
}

const DEFAULT_BASE_URL = "https://indodax.com/tapi";
const DEFAULT_TIMEOUT = 10_000;
const DEFAULT_RECV_WINDOW = 5_000;

const AUTH_ERROR_PATTERNS = [
  "invalid sign",
  "invalid key",
  "invalid api key",
  "key or sign",
  "unauthorized",
];

export class IndodaxPrivateClient {
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly recvWindow: number;

  constructor(
    private readonly credentials: IndodaxCredentials,
    options: IndodaxPrivateClientOptions = {}
  ) {
    if (!credentials?.apiKey || !credentials?.secretKey) {
      throw new AuthenticationError(
        "IndodaxPrivateClient membutuhkan apiKey dan secretKey.",
        { exchange: "indodax" }
      );
    }

    this.baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = options.timeout ?? DEFAULT_TIMEOUT;
    this.recvWindow = options.recvWindow ?? DEFAULT_RECV_WINDOW;
  }

  async call<T>(
    method: string,
    params: Record<string, string | number | boolean> = {}
  ): Promise<T> {
    const requestParams = {
      method,
      timestamp: Date.now(),
      recvWindow: this.recvWindow,
      ...params,
    };

    const { totalParams, signature } = RequestSigner.signParams(
      this.credentials.secretKey,
      requestParams
    );

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    let response: Response;

    try {
      response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          Key: this.credentials.apiKey,
          Sign: signature,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: totalParams,
        signal: controller.signal,
      });
    } catch (error) {
      throw new NetworkError(
        error instanceof Error
          ? error.message
          : "Indodax private API request gagal (network)."
      );
    } finally {
      clearTimeout(timer);
    }

    if (response.status === 429) {
      throw new RateLimitError("Indodax rate limit exceeded.");
    }

    if (!response.ok) {
      throw new NetworkError(`HTTP ${response.status}`);
    }

    const json = (await response.json()) as IndodaxRawResponse<T>;

    if (json.success !== 1) {
      const message = json.error ?? "Indodax private API request failed.";

      if (this.looksLikeAuthError(message)) {
        throw new AuthenticationError(message, {
          exchange: "indodax",
          code: json.error_code,
        });
      }

      throw new ExchangeError(message, {
        exchange: "indodax",
        code: json.error_code,
        recoverable: false,
      });
    }

    return json.return as T;
  }

  private looksLikeAuthError(message: string): boolean {
    const lower = message.toLowerCase();
    return AUTH_ERROR_PATTERNS.some((pattern) => lower.includes(pattern));
  }
}

export default IndodaxPrivateClient;
