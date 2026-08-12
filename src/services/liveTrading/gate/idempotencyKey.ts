/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 6
 * Idempotency Key
 * ==========================================================
 */

export interface IdempotencyInput {
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly quantity: number;
  readonly quoteAmount?: number;
  readonly signalId?: string;
}

export function createIdempotencyKey(
  input: IdempotencyInput,
): string {
  const symbol =
    input.symbol
      .trim()
      .toLowerCase();

  const signal =
    input.signalId?.trim() ||
    "nosignal";

  const quantity =
    Number(input.quantity)
      .toFixed(12);

  const quote =
    Number(
      input.quoteAmount ?? 0,
    ).toFixed(2);

  return [
    "autoidx",
    "v38",
    signal,
    symbol,
    input.side,
    quantity,
    quote,
  ].join(":");
}
