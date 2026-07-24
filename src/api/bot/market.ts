/**
==========================================================
AutoIDX
Market Scanner
Version : 0.0.1 Alpha
==========================================================
*/

import { API } from "./constants";

export interface MarketTicker {
  pair: string;
  last: number;
  high: number;
  low: number;
  buy: number;
  sell: number;
  volume: number;
}

const DEFAULT_PAIRS = [
  "btcidr",
  "ethidr",
  "solidr",
  "xrpidr",
  "dogeidr",
];

export async function getTicker(
  pair: string
): Promise<MarketTicker | null> {

  try {

    const response = await fetch(
      `${API.PUBLIC_BASE_URL}/${pair}/ticker`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    const json = await response.json();

    const ticker = json.ticker;

    return {

      pair,

      last: Number(ticker.last),

      high: Number(ticker.high),

      low: Number(ticker.low),

      buy: Number(ticker.buy),

      sell: Number(ticker.sell),

      volume: Number(ticker.vol_idr ?? 0),

    };

  } catch {

    return null;

  }

}

export async function scanMarket(
  pairs: string[] = DEFAULT_PAIRS
): Promise<MarketTicker[]> {

  const results: MarketTicker[] = [];

  await Promise.all(

    pairs.map(async (pair) => {

      const ticker = await getTicker(pair);

      if (ticker) {

        results.push(ticker);

      }

    })

  );

  return results;

}
