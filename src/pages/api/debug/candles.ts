/**
==========================================================
AURA Trade OS
Debug: Indodax Candles Raw Response
Version : 0.0.1 Alpha

Endpoint SEMENTARA untuk diagnosa kenapa getClosePrices()
selalu return 0 data. Buka langsung di browser:
https://domain-kamu.vercel.app/api/debug/candles

HAPUS FILE INI setelah masalah selesai - jangan biarkan
endpoint debug nganggur di production selamanya.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const pair = (req.query.pair as string) ?? "btc_idr";
  const tf = (req.query.tf as string) ?? "60";

  const to = Math.floor(Date.now() / 1000);
  const from = to - 3600 * 100;

  const symbol = pair.replace("_", "").toUpperCase();

  const url =
    `https://indodax.com/tradingview/history_v2` +
    `?symbol=${symbol}` +
    `&tf=${tf}` +
    `&from=${from}` +
    `&to=${to}`;

  const debug: Record<string, unknown> = {
    requestedPair: pair,
    resolvedSymbol: symbol,
    requestedTf: tf,
    from,
    to,
    fromReadable: new Date(from * 1000).toISOString(),
    toReadable: new Date(to * 1000).toISOString(),
    finalUrl: url,
  };

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    debug.httpStatus = response.status;
    debug.httpOk = response.ok;

    const text = await response.text();
    debug.rawResponseText = text;

    try {
      debug.parsedJson = JSON.parse(text);
    } catch {
      debug.parseError = "Response bukan JSON valid.";
    }

  } catch (error) {
    debug.fetchError =
      error instanceof Error ? error.message : String(error);
  }

  return res.status(200).json(debug);
}
