/**
==========================================================
AURA Trade OS
Automation Dispatcher
Version : 0.1.0 Alpha
==========================================================
UPDATE (integrasi api/webhook -- sebelumnya orphan total, tidak
diimpor dari mana pun): dipakai sebagai lapisan dispatch dari
webhook eksternal (TradingView/Telegram/Discord/dst, lihat
api/webhook/service.ts) ke aksi nyata di sistem.

Perubahan:
- SCAN_MARKET sekarang panggil runScanCycle() (scan + kalibrasi +
  trading engine LENGKAP, jalur sama persis dengan cron), BUKAN
  cuma marketScanner.scanMarket() (yang cuma scan tanpa eksekusi
  apa pun). Alasan aman: runScanCycle() -> executeCron() tetap
  melewati SEMUA risk gate yang sudah ada (emergency stop, max
  open position, daily loss limit, cooldown, exposure) -- memicu
  siklus ini lebih awal dari jadwal TIDAK melewati satu pun
  proteksi itu.
- RUN_CRON/RUN_ENGINE ikut disatukan ke runScanCycle() (sebelumnya
  RUN_CRON manggil executeCron() TANPA candidatePairs dari scan,
  jadi cuma memproses posisi terbuka + watchlist manual, tidak
  dapat manfaat penuh dari scan seluruh market).
- TAMBAH job type baru: PAUSE_TRADING & RESUME_TRADING -- toggle
  emergencyStop lewat botControl.ts. SENGAJA TIDAK ADA job type
  "BUY"/"SELL" langsung -- webhook eksternal TIDAK BOLEH memicu
  order secara langsung (bypass scan/strategy/risk-gate), cuma
  boleh memicu siklus yang SUDAH melewati semua proteksi itu, atau
  membuat sistem LEBIH konservatif (pause), tidak pernah sebaliknya.
==========================================================
*/

import { runScanCycle } from "../scheduler/scanCycle";
import { recordLog } from "../firebase/logService";
import { updateBotControl } from "../firebase/botControl";

export type DispatchJobType =
  | "SCAN_MARKET"
  | "RUN_ENGINE"
  | "RUN_CRON"
  | "HEALTH_CHECK"
  | "PAUSE_TRADING"
  | "RESUME_TRADING";

export interface DispatchJob {

  id: string;

  type: DispatchJobType;

  payload?: Record<string, unknown>;

  createdAt: string;

}

export interface DispatchResult {

  success: boolean;

  jobId: string;

  type: DispatchJobType;

  startedAt: string;

  finishedAt: string;

  durationMs: number;

  result?: unknown;

  error?: string;

}

export class AutomationDispatcher {

  /**
   * Menjalankan job berdasarkan tipe
   */
  async dispatch(
    job: DispatchJob
  ): Promise<DispatchResult> {

    const started = Date.now();

    try {

      let result: unknown;

      switch (job.type) {

        case "SCAN_MARKET":
        case "RUN_ENGINE":
        case "RUN_CRON": {

          // Ketiga tipe job ini sekarang alias ke siklus yang sama
          // (scan seluruh market -> kalibrasi -> trading engine
          // dengan risk gate penuh). Dipertahankan sebagai 3 nama
          // job berbeda supaya pemanggil lama (kalau ada) tetap
          // valid, bukan karena perilakunya benar-benar berbeda.
          result = await runScanCycle();

          break;

        }

        case "PAUSE_TRADING": {

          const triggeredBy =
            (job.payload?.triggeredBy as string) ?? "unknown";

          const control = await updateBotControl(
            { emergencyStop: true },
            triggeredBy
          );

          await recordLog(
            "RISK",
            "warning",
            `[Dispatcher] Emergency stop DIAKTIFKAN lewat ${triggeredBy} -- BUY baru diblokir, posisi terbuka tetap bisa SELL.`
          );

          result = control;

          break;

        }

        case "RESUME_TRADING": {

          const triggeredBy =
            (job.payload?.triggeredBy as string) ?? "unknown";

          const control = await updateBotControl(
            { emergencyStop: false },
            triggeredBy
          );

          await recordLog(
            "RISK",
            "warning",
            `[Dispatcher] Emergency stop DIMATIKAN lewat ${triggeredBy} -- BUY baru diizinkan lagi.`
          );

          result = control;

          break;

        }

        case "HEALTH_CHECK": {

          result = {

            status: "OK",

            timestamp: new Date().toISOString(),

          };

          break;

        }

        default:

          throw new Error(
            `Unknown job type: ${job.type}`
          );

      }

      await recordLog(
        "SYSTEM",
        "success",
        `[Dispatcher] ${job.type} completed`
      );

      const finished = Date.now();

      return {

        success: true,

        jobId: job.id,

        type: job.type,

        startedAt: new Date(
          started
        ).toISOString(),

        finishedAt: new Date(
          finished
        ).toISOString(),

        durationMs:
          finished - started,

        result,

      };

    } catch (error) {

      console.error(
        "[Dispatcher]",
        error
      );

      await recordLog(
        "SYSTEM",
        "danger",
        `[Dispatcher] ${job.type} failed`
      );

      const finished = Date.now();

      return {

        success: false,

        jobId: job.id,

        type: job.type,

        startedAt: new Date(
          started
        ).toISOString(),

        finishedAt: new Date(
          finished
        ).toISOString(),

        durationMs:
          finished - started,

        error:
          error instanceof Error
            ? error.message
            : "Unknown dispatcher error",

      };

    }

  }

  /**
   * Membuat Job baru
   */
  createJob(
    type: DispatchJobType,
    payload?: Record<string, unknown>
  ): DispatchJob {

    return {

      id:
        crypto.randomUUID(),

      type,

      payload,

      createdAt:
        new Date().toISOString(),

    };

  }

}

const automationDispatcher =
  new AutomationDispatcher();

export default automationDispatcher;
