/**
==========================================================
AURA Trade OS
Trading Scheduler (Cron)
Version : 0.0.7 Alpha
==========================================================
*/

import { runTradingEngine } from "../trading/engine";
import { recordLog } from "../firebase/logService";

export interface CronResult {
  success: boolean;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  message: string;
}

export async function executeCron(): Promise<CronResult> {

  const started = Date.now();

  try {

    await recordLog(
      "info",
      "Cron execution started."
    );

    const engineResult =
      await runTradingEngine();

    const finished = Date.now();

    const result: CronResult = {

      success: engineResult.success,

      startedAt: new Date(started).toISOString(),

      finishedAt: new Date(finished).toISOString(),

      durationMs: finished - started,

      message: engineResult.reason,

    };

    await recordLog(
      engineResult.success
        ? "success"
        : "warning",
      `Trading Engine: ${engineResult.reason}`
    );

    return result;

  } catch (error) {

    console.error(
      "[Scheduler]",
      error
    );

    await recordLog(
      "danger",
      "Cron execution failed."
    );

    const finished = Date.now();

    return {

      success: false,

      startedAt: new Date(started).toISOString(),

      finishedAt: new Date(finished).toISOString(),

      durationMs: finished - started,

      message:
        error instanceof Error
          ? error.message
          : "Unknown scheduler error",

    };

  }

}

/**
 * Alias
 */
export default executeCron;
