export interface ExchangeResponse<T> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: { readonly code: string; readonly message: string };
  readonly requestId?: string;
}
