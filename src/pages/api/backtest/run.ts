/**
==========================================================
AURA Trade OS
Backtest Run Endpoint
Version : 0.1.2 Alpha
==========================================================
Fetches historical candles from Indodax and runs them
through the BacktestRunner engine, returning a full
BacktestReport.

Perubahan dari 0.1.1: input body sekarang divalidasi
menyeluruh sebelum dipakai (sebelumnya HANYA timeframe yang
divalidasi lewat lookup RESOLUTION_BY_TIMEFRAME):
- `pair` -- format divalidasi (validateTradingPair, sudah
  reachable & dipakai /api/settings) sebelum dikirim ke
  Indodax lewat getCandles(). Sebelumnya string apa pun
  langsung diteruskan.
- `strategy` -- diverifikasi terhadap VALID_STRATEGIES
  (AURA_TREND/EMA_CROSSOVER/MOMENTUM). Menerapkan draft yang
  sebelumnya sempat dibuat di services/backtest/run.ts (v0.1.1,
  tidak reachable dari Next.js -- file salah lokasi, tidak
  pernah jadi API route) tapi TIDAK PERNAH diterapkan ke file
  aktif ini.
- `days`, `initialCapital`, `feeRate`, `slippage` -- divalidasi
  numerik (NumberValidator, sudah reachable & dipakai
  /api/settings). Sebelumnya `Number(days)` yang NaN (mis. body
  kosong/string sampah) mengalir diam-diam ke Math.max/Math.min
  jadi NaN, lalu `limit` NaN diteruskan ke getCandles() tanpa
  error yang jelas.
Ini backtest (paper/simulasi historis) -- TIDAK menyentuh
eksekusi order live sama sekali.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";

import { getCandles } from "@/services/indodax/candles";
import backtestRunner from "@/services/backtest/runner";
import backtestReport from "@/services/backtest/report";
import metricsEngine from "@/services/backtest/metrics";
import type {
  BacktestCandle,
  BacktestConfig,
  BacktestResult,
} from "@/services/backtest/types";
import { validateTradingPair } from "@/lib/validators/market";
import NumberValidator from "@/lib/validators/number";

const RESOLUTION_BY_TIMEFRAME: Record<string, string> = {
  "1h": "60",
  "4h": "240",
  "1d": "1D",
};

const CANDLES_PER_DAY: Record<string, number> = {
  "1h": 24,
  "4h": 6,
  "1d": 1,
};

const MAX_CANDLES = 1000;

const VALID_STRATEGIES = ["AURA_TREND", "EMA_CROSSOVER", "MOMENTUM"];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      pair: rawPair = "btc_idr",
      timeframe = "1h",
      days: rawDays = 30,
      initialCapital: rawInitialCapital = 1000000,
      strategy = "EMA_CROSSOVER",
      feeRate: rawFeeRate = 0.003,
      slippage: rawSlippage = 0.001,
    } = req.body ?? {};

    let pair: string;
    let days: number;
    let initialCapital: number;
    let feeRate: number;
    let slippage: number;

    try {
      pair = validateTradingPair(rawPair);
      days = NumberValidator.positive(rawDays, "Days");
      initialCapital = NumberValidator.positive(
        rawInitialCapital,
        "Initial Capital"
      );
      feeRate = NumberValidator.between(rawFeeRate, 0, 1, "Fee Rate");
      slippage = NumberValidator.between(rawSlippage, 0, 1, "Slippage");
    } catch (validationError) {
      return res.status(400).json({
        error:
          validationError instanceof Error
            ? validationError.message
            : "Input backtest tidak valid.",
      });
    }

    if (!VALID_STRATEGIES.includes(strategy)) {
      return res.status(400).json({
        error: `Strategi tidak dikenal: "${strategy}". Pilihan yang valid: ${VALID_STRATEGIES.join(", ")}.`,
      });
    }

    const resolution = RESOLUTION_BY_TIMEFRAME[timeframe];

    if (!resolution) {
      return res.status(400).json({
        error: `Timeframe tidak didukung: ${timeframe}`,
      });
    }

    const perDay = CANDLES_PER_DAY[timeframe];
    const limit = Math.min(
      MAX_CANDLES,
      Math.max(perDay * days, perDay)
    );

    const rawCandles = await getCandles({
      pair,
      resolution,
      limit,
    });

    if (!rawCandles.length) {
      return res.status(502).json({
        error:
          "Gagal mengambil data candle historis dari Indodax. Coba lagi beberapa saat.",
      });
    }

    const candles: BacktestCandle[] = rawCandles.map((c) => ({
      timestamp: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
      volume: c.volume,
      pair,
    }));

    const config: BacktestConfig = {
      pair,
      timeframe,
      startTime: candles[0].timestamp,
      endTime: candles[candles.length - 1].timestamp,
      initialCapital,
      feeRate,
      slippage,
      strategy,
    };

    const { result: rawResult, duration } = backtestRunner.run(
      candles,
      config
    );

    const metrics = metricsEngine.calculate(
      rawResult.trades,
      rawResult.equityCurve
    );

    const finalCapital = rawResult.portfolio.equity;

    const result: BacktestResult = {
      strategy,
      pair,
      status: "COMPLETED",
      initialCapital: config.initialCapital,
      finalCapital,
      profitLoss: finalCapital - config.initialCapital,
      metrics,
      trades: rawResult.trades,
      equityCurve: rawResult.equityCurve,
      createdAt: Date.now(),
    };

    const report = backtestReport.generate(result);

    return res.status(200).json({
      report,
      trades: result.trades,
      candleCount: candles.length,
      durationMs: duration,
    });
  } catch (error) {
    console.error("[BACKTEST RUN ERROR]", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Gagal menjalankan backtest.",
    });
  }
}
