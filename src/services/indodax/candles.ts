/**
==========================================================
AURA Trade OS
Indodax Candlestick Service
Version : 0.0.6 Alpha

Perubahan dari 0.0.5: fix 2 bug yang bikin getClosePrices()
selalu return array kosong -
1. Symbol masih mengandung underscore ("BTC_IDR") padahal
   API Indodax butuh tanpa underscore ("BTCIDR").
2. Parameter query salah nama: kode kirim "resolution",
   padahal API mewajibkan nama parameter "tf".
==========================================================
*/

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CandleOptions {
  pair?: string;
  resolution?: string;
  limit?: number;
}

const DEFAULT_PAIR = "btcidr";
const DEFAULT_RESOLUTION = "60";
const DEFAULT_LIMIT = 200;

export async function getCandles(
  options: CandleOptions = {}
): Promise<Candle[]> {
  const pair = options.pair ?? DEFAULT_PAIR;
  const resolution = options.resolution ?? DEFAULT_RESOLUTION;
  const limit = options.limit ?? DEFAULT_LIMIT;

  const to = Math.floor(Date.now() / 1000);

  let seconds = 3600;

  switch (resolution) {
    case "1":
      seconds = 60;
      break;
    case "5":
      seconds = 300;
      break;
    case "15":
      seconds = 900;
      break;
    case "30":
      seconds = 1800;
      break;
    case "60":
      seconds = 3600;
      break;
    case "240":
      seconds = 14400;
      break;
    case "1D":
      seconds = 86400;
      break;
    case "1W":
      seconds = 604800;
      break;
  }

  const from = to - seconds * limit;

  const url =
    `https://indodax.com/tradingview/history_v2` +
    `?symbol=${pair.replace("_", "").toUpperCase()}` +
    `&tf=${resolution}` +
    `&from=${from}` +
    `&to=${to}`;

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 30,
      },
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data.s !== "ok") {
      console.error(
        `[Indodax Candles] Response tidak ok untuk ${pair} (tf=${resolution}):`,
        JSON.stringify(data)
      );
      return [];
    }

    const candles: Candle[] = [];

    for (let i = 0; i < data.t.length; i++) {
      candles.push({
        time: Number(data.t[i]),
        open: Number(data.o[i]),
        high: Number(data.h[i]),
        low: Number(data.l[i]),
        close: Number(data.c[i]),
        volume: Number(data.v[i]),
      });
    }

    return candles;
  } catch (error) {
    console.error("[Indodax Candles Error]", error);
    return [];
  }
}

/**
 * Mengambil hanya harga penutupan (close price)
 */
export async function getClosePrices(
  options?: CandleOptions
): Promise<number[]> {
  const candles = await getCandles(options);
  return candles.map((c) => c.close);
}

/**
 * Mengambil candle terakhir
 */
export async function getLatestCandle(
  options?: CandleOptions
): Promise<Candle | null> {
  const candles = await getCandles(options);

  if (!candles.length) {
    return null;
  }

  return candles[candles.length - 1];
}

export default {
  getCandles,
  getClosePrices,
  getLatestCandle,
};
