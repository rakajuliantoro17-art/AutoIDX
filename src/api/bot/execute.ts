/**
==========================================================
AutoIDX
Bot Execution Orchestrator
Version : 0.1.0 Alpha

Perubahan dari 0.0.1: SEBELUMNYA fungsi ini scaffolding kosong
-- semua langkah (scan market, analisis strategi, risk
validation, eksekusi order) cuma komentar "// TODO", tidak
pernah benar-benar jalan, tapi TETAP mengembalikan
{success:true, message:"Bot executed successfully"} dengan
statistik nol semua. Endpoint /api/bot yang memanggil ini
SUDAH aktif (App Router, ada dynamic export), jadi kalau ada
yang memanggilnya, dia akan dapat respons sukses palsu.

Sekarang benar-benar memanggil executeCron() (services/
scheduler/cron.ts) -- pipeline pemrosesan pair yang SAMA
persis dipakai jalur terjadwal (Vercel Cron), supaya endpoint
ini jadi pemicu manual/on-demand yang genuinely menjalankan
TradingEngine, bukan endpoint kedua dengan logika terpisah
yang bisa menyimpang dari jalur utama.
==========================================================
*/

import { BOT, STATUS } from "./constants";
import { executeCron } from "@/services/scheduler/cron";

export interface ExecuteResult {
  success: boolean;
  status: string;
  version: string;
  mode: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;

  statistics: {
    pairsScanned: number;
    buySignals: number;
    sellSignals: number;
    holdSignals: number;
    executedOrders: number;
  };

  message: string;
}

export async function executeBot(): Promise<ExecuteResult> {
  const started = Date.now();

  try {

    const mode = process.env.BOT_MODE ?? "paper";

    // executeCron() sendiri sudah menangani: ambil watchlist +
    // pair posisi terbuka, bangun IndicatorFeatureVector dari
    // candle asli, panggil TradingEngine.run() per pair (sumber
    // sinyal strategyManager + sanity check + AI advisory + risk
    // gate + eksekusi paper/live) -- lihat services/scheduler/
    // cron.ts untuk detail lengkap pipeline-nya.
    const cronResult = await executeCron();

    const buySignals = cronResult.results.filter((r) => r.signal === "BUY").length;
    const sellSignals = cronResult.results.filter((r) => r.signal === "SELL").length;
    const holdSignals = cronResult.results.filter((r) => r.signal === "HOLD").length;
    const executedOrders = cronResult.results.filter((r) => r.actionExecuted).length;

    const finished = Date.now();

    return {
      success: cronResult.success,

      status: cronResult.success ? STATUS.SUCCESS : STATUS.FAILED,

      version: BOT.VERSION,

      mode,

      startedAt: cronResult.startedAt,

      finishedAt: cronResult.finishedAt,

      durationMs: finished - started,

      statistics: {
        pairsScanned: cronResult.pairsProcessed.length,
        buySignals,
        sellSignals,
        holdSignals,
        executedOrders,
      },

      message: cronResult.success
        ? `Bot executed successfully. ${cronResult.pairsProcessed.length} pair diproses, ${executedOrders} order dieksekusi.`
        : `Bot execution selesai dengan sebagian pair gagal: ${cronResult.results
            .filter((r) => !r.success)
            .map((r) => `${r.pair} (${r.message})`)
            .join("; ")}`,
    };

  } catch (error) {
    const finished = Date.now();

    return {
      success: false,

      status: STATUS.FAILED,

      version: BOT.VERSION,

      mode: process.env.BOT_MODE ?? "paper",

      startedAt: new Date(started).toISOString(),

      finishedAt: new Date(finished).toISOString(),

      durationMs: finished - started,

      statistics: {
        pairsScanned: 0,
        buySignals: 0,
        sellSignals: 0,
        holdSignals: 0,
        executedOrders: 0,
      },

      message:
        error instanceof Error
          ? error.message
          : "Unknown execution error.",
    };
  }
}
