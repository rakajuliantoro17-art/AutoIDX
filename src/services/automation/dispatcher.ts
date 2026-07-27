/**
==========================================================
AURA Trade OS
Automation Dispatcher
Version : 0.0.8 Alpha
==========================================================
*/

import marketScanner from "../scanner";
import { executeCron } from "../scheduler/cron";
import { recordLog } from "../firebase/logService";

export type DispatchJobType =
  | "SCAN_MARKET"
  | "RUN_ENGINE"
  | "RUN_CRON"
  | "HEALTH_CHECK";

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

        case "SCAN_MARKET": {

          const pairs =
            (job.payload?.pairs as string[]) ??
            undefined;

          result =
            await marketScanner.scanMarket(
              pairs
            );

          break;

        }

        case "RUN_ENGINE": {
          // Catatan: TradingEngine butuh input (pair/price/rsi/ema),
          // dan executeCron() sudah mengorkestrasi pengambilan data
          // itu + panggil TradingEngine. Job ini alias ke situ
          // sampai ada kebutuhan spesifik yang berbeda dari RUN_CRON.
          result =
            await executeCron();

          break;

        }

        case "RUN_CRON": {

          result =
            await executeCron();

          break;

        }

        case "HEALTH_CHECK": {

          result = {

            status: "OK",

            timestamp: new Date().toISOString(),

            uptime: process.uptime(),

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
