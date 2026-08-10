/**
==========================================================
AURA Trade OS
Backtest Run Endpoint
Version : 0.1.0 Alpha
==========================================================
Fetches historical candles from Indodax and runs them
through the BacktestRunner engine, returning a full
BacktestReport.
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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      pair = "btc_idr",
      timeframe = "1h",
      days = 30,
      initialCapital = 1000000,
      strategy = "EMA_CROSSOVER",
      feeRate = 0.003,
      slippage = 0.001,
    } = req.body ?? {};

    const resolution = RESOLUTION_BY_TIMEFRAME[timeframe];

    if (!resolution) {
      return res.status(400).json({
        error: `Timeframe tidak didukung: ${timeframe}`,
      });
    }

    const perDay = CANDLES_PER_DAY[timeframe];
    const limit = Math.min(
      MAX_CANDLES,
      Math.max(perDay * Number(days), perDay)
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
      initialCapital: Number(initialCapital),
      feeRate: Number(feeRate),
      slippage: Number(slippage),
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
