/**
==========================================================
AURA Trade OS
Indodax Candlestick Service
Version : 0.0.8 Alpha
Perubahan dari 0.0.7: fetch() ke Indodax SEBELUMNYA tidak punya
timeout sama sekali -- kalau koneksi hang/sangat lambat, request
bisa menggantung tanpa batas, berpotensi menghabiskan seluruh
budget waktu siklus cron (batas keras 30 detik di cron-job.org,
trigger utama). Fungsi ini dipanggil untuk SETIAP pair yang
diproses (market scan + evaluasi candidate), jadi satu request
yang nyangkut bisa menahan seluruh siklus. Ditambahkan
AbortController dengan timeout 6 detik, sama seperti yang sudah
dipakai liveTrading/exchange/indodaxClient.ts.
==========================================================
*/

const CANDLES_FETCH_TIMEOUT_MS = 6_000;

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {}
): Promise<Response> {

  const controller = new AbortController();

  const timeout = setTimeout(
    () => controller.abort(),
    CANDLES_FETCH_TIMEOUT_MS
  );

  try {

    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });

  } catch (error) {

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Indodax candles request timed out after ${CANDLES_FETCH_TIMEOUT_MS}ms: ${url}`
      );
    }

    throw error;

  } finally {

    clearTimeout(timeout);

  }

}

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
    const response = await fetchWithTimeout(url, {
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

    // Respons asli Indodax: ARRAY POLOS [{Time,Open,High,Low,Close,Volume}, ...]
    // BUKAN format TradingView UDF {s,t,o,h,l,c,v}
    if (!Array.isArray(data)) {
      console.error(
        `[Indodax Candles] Response bukan array untuk ${pair} (tf=${resolution}):`,
        JSON.stringify(data).slice(0, 200)
      );
      return [];
    }

    const candles: Candle[] = data.map((item: any) => ({
      time: Number(item.Time),
      open: Number(item.Open),
      high: Number(item.High),
      low: Number(item.Low),
      close: Number(item.Close),
      volume: Number(item.Volume),
    }));

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
