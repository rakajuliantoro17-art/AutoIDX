/**
==========================================================
AURA Trade OS
Batch Backtest Endpoint
Version : 0.1.0 Alpha
==========================================================
File BARU (bukan menggantikan /api/backtest/run yang sudah ada
dan tetap dipakai untuk single-pair test dari halaman /backtest).

Tujuan: memberi BUKTI historis lintas BANYAK pair sekaligus --
langkah nyata menuju "auto live trading" yang optimal di seluruh
Indodax, bukan cuma menambah kode tanpa validasi. Sebelum makin
percaya menyalakan live trading otomatis di semakin banyak pair,
kita perlu tahu dulu: strategi yang sama persis dipakai jalur live
(AURA_TREND, lewat @/services/strategy/*) itu SECARA HISTORIS
untung atau rugi di pair-pair yang paling sering direkomendasikan
scanner?

Kalau `pairs` tidak diberikan di body request, default-nya adalah
`topOpportunities` hasil MarketScanner SAAT INI (pair-pair yang
sedang direkomendasikan scanner untuk live trading) -- supaya yang
diuji historis adalah pair yang RELEVAN hari ini, bukan daftar
statis sembarangan.

Dibatasi maksimal MAX_PAIRS_PER_BATCH pair per panggilan, dan
request candle ke Indodax per pair dijalankan dengan concurrency
terbatas (pola sama seperti scanner/index.ts) -- supaya tidak
menembak rate limit publik Indodax (180 request/menit) kalau
pair yang diuji cukup banyak.
==========================================================
*/

import type { NextApiRequest, NextApiResponse } from "next";

import { getCandles } from "@/services/indodax/candles";
import backtestRunner from "@/services/backtest/runner";
import metricsEngine from "@/services/backtest/metrics";
import type { BacktestCandle, BacktestConfig } from "@/services/backtest/types";
import marketScanner from "@/services/scanner";

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

// Batas jumlah pair per panggilan batch -- cukup untuk lihat
// gambaran menyeluruh, tanpa membuat satu request HTTP jadi
// terlalu lama / terlalu banyak menembak Indodax sekaligus.
const MAX_PAIRS_PER_BATCH = 15;

// Berapa banyak pair diproses bersamaan (tiap pair butuh 1 request
// candle historis ke Indodax).
const BATCH_CONCURRENCY = 4;

interface BatchPairResult {
  pair: string;
  status: "OK" | "ERROR";
  error?: string;
  candleCount?: number;
  initialCapital?: number;
  finalCapital?: number;
  returnPercent?: number;
  totalTrades?: number;
  winRate?: number;
  maxDrawdown?: number;
  profitFactor?: number;
  sharpeRatio?: number;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function run() {
    while (cursor < items.length) {
      const currentIndex = cursor;
      cursor += 1;
      results[currentIndex] = await worker(items[currentIndex]);
    }
  }

  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, run));

  return results;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      pairs,
      timeframe = "1h",
      days = 30,
      initialCapital = 1000000,
      // Default AURA_TREND -- strategi yang SAMA PERSIS dipakai
      // jalur live trading (engine.ts), bukan EMA_CROSSOVER.
      // Tujuan batch test ini memang memvalidasi strategi live,
      // bukan sekadar strategi pembanding.
      strategy = "AURA_TREND",
      feeRate = 0.003,
      slippage = 0.001,
    } = req.body ?? {};

    const resolution = RESOLUTION_BY_TIMEFRAME[timeframe];

    if (!resolution) {
      return res.status(400).json({
        error: `Timeframe tidak didukung: ${timeframe}`,
      });
    }

    let targetPairs: string[] =
      Array.isArray(pairs) && pairs.length > 0
        ? pairs.map((p: string) => String(p).toLowerCase())
        : [];

    let pairSource: "manual" | "scanner" = "manual";

    if (targetPairs.length === 0) {
      // Tidak ada pair spesifik diberikan -- pakai top opportunities
      // hasil scan seluruh market Indodax SAAT INI.
      const summary = await marketScanner.scanMarket();
      targetPairs = summary.topOpportunities.map((o) => o.pair);
      pairSource = "scanner";
    }

    if (targetPairs.length === 0) {
      return res.status(200).json({
        strategy,
        timeframe,
        days,
        pairSource,
        results: [],
        aggregate: null,
        note:
          "Tidak ada pair top-opportunity dari scanner saat ini (market sedang sepi / belum ada yang lolos skor minimum). Coba lagi nanti, atau kirim `pairs` secara manual di body request.",
      });
    }

    const truncated = targetPairs.length > MAX_PAIRS_PER_BATCH;
    targetPairs = targetPairs.slice(0, MAX_PAIRS_PER_BATCH);

    const perDay = CANDLES_PER_DAY[timeframe];
    const limit = Math.min(
      MAX_CANDLES,
      Math.max(perDay * Number(days), perDay)
    );

    const results = await mapWithConcurrency<string, BatchPairResult>(
      targetPairs,
      BATCH_CONCURRENCY,
      async (pair) => {
        try {
          const rawCandles = await getCandles({ pair, resolution, limit });

          if (!rawCandles.length) {
            return {
              pair,
              status: "ERROR",
              error: "Data candle historis tidak tersedia dari Indodax.",
            };
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

          const { result: rawResult } = backtestRunner.run(candles, config);

          const metrics = metricsEngine.calculate(
            rawResult.trades,
            rawResult.equityCurve
          );

          const finalCapital = rawResult.portfolio.equity;

          const returnPercent =
            config.initialCapital > 0
              ? Math.round(
                  ((finalCapital - config.initialCapital) /
                    config.initialCapital) *
                    10000
                ) / 100
              : 0;

          return {
            pair,
            status: "OK",
            candleCount: candles.length,
            initialCapital: config.initialCapital,
            finalCapital,
            returnPercent,
            totalTrades: metrics.totalTrades,
            winRate: metrics.winRate,
            maxDrawdown: metrics.maxDrawdown,
            profitFactor: metrics.profitFactor,
            sharpeRatio: metrics.sharpeRatio,
          };
        } catch (error) {
          return {
            pair,
            status: "ERROR",
            error:
              error instanceof Error
                ? error.message
                : "Gagal menjalankan backtest untuk pair ini.",
          };
        }
      }
    );

    const ok = results.filter((r) => r.status === "OK");

    const aggregate =
      ok.length > 0
        ? {
            pairsTested: ok.length,
            pairsFailed: results.length - ok.length,
            avgReturnPercent:
              Math.round(
                (ok.reduce((sum, r) => sum + (r.returnPercent ?? 0), 0) /
                  ok.length) *
                  100
              ) / 100,
            avgWinRate:
              Math.round(
                (ok.reduce((sum, r) => sum + (r.winRate ?? 0), 0) /
                  ok.length) *
                  100
              ) / 100,
            profitablePairs: ok.filter((r) => (r.returnPercent ?? 0) > 0)
              .length,
            bestPair: [...ok].sort(
              (a, b) => (b.returnPercent ?? 0) - (a.returnPercent ?? 0)
            )[0]?.pair,
            worstPair: [...ok].sort(
              (a, b) => (a.returnPercent ?? 0) - (b.returnPercent ?? 0)
            )[0]?.pair,
          }
        : null;

    return res.status(200).json({
      strategy,
      timeframe,
      days,
      pairSource,
      truncatedToMax: truncated ? MAX_PAIRS_PER_BATCH : undefined,
      results,
      aggregate,
    });
  } catch (error) {
    console.error("[BACKTEST BATCH ERROR]", error);
    return res.status(500).json({
      error:
        error instanceof Error
          ? error.message
          : "Gagal menjalankan batch backtest.",
    });
  }
}
