/**
 * ==========================================================
 * AutoIDX — Indodax Request Signer
 * Phase 38 / Batch 2
 * ==========================================================
 */

import {
  createHmac,
} from "node:crypto";

export interface SignedIndodaxRequest {
  body: string;

  signature: string;

  contentType: "application/x-www-form-urlencoded";
}

export interface IndodaxSignInput {
  apiKey: string;

  apiSecret: string;

  method: string;

  nonce: number;

  params?: Record<
    string,
    string | number | boolean
  >;
}

const encodeParams = (
  params: Record<
    string,
    string | number | boolean
  >,
): string => {
  return Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(
          String(value),
        )}`,
    )
    .join("&");
};

export const signIndodaxRequest = (
  input: IndodaxSignInput,
): SignedIndodaxRequest => {
  const body = encodeParams({
    method: input.method,
    nonce: input.nonce,
    ...(input.params ?? {}),
  });

  const signature = createHmac(
    "sha512",
    input.apiSecret,
  )
    .update(body)
    .digest("hex");

  return {
    body,
    signature,
    contentType:
      "application/x-www-form-urlencoded",
  };
};

export const createNonce = (): number => {
  return Date.now();
};
