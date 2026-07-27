/**
==========================================================
AURA Trade OS
Automation Engine
Version : 0.0.8 Alpha
==========================================================
*/

import dispatcher from "./dispatcher";
import {
  sendHeartbeat,
} from "../scheduler/heartbeat";

import {
  recordLog,
} from "../firebase/logService";

export interface AutomationEngineOptions {

  pairs?: string[];

  enableHeartbeat?: boolean;

  enableScanner?: boolean;

  enableTrading?: boolean;

}

export interface AutomationEngineResult {

  success: boolean;

  startedAt: string;

  finishedAt: string;

  durationMs: number;

  executedJobs: number;

  results: unknown[];

}

export class AutomationEngine {

  /**
   * Menjalankan seluruh workflow otomatis
   */
  async run(
    options: AutomationEngineOptions = {}
  ): Promise<AutomationEngineResult> {

    const started = Date.now();

    const results: unknown[] = [];

    let executedJobs = 0;

    try {

      await recordLog(
                "SYSTEM",
        "info",
        "[Automation] Engine started."
      );

      /**
       * Heartbeat
       */
      if (
        options.enableHeartbeat !== false
      ) {

        await sendHeartbeat();

      }

      /**
       * Market Scanner
       */
      if (
        options.enableScanner !== false
      ) {

        const scanJob =
          dispatcher.createJob(
            "SCAN_MARKET",
            {
              pairs:
                options.pairs,
            }
          );

        const scanResult =
          await dispatcher.dispatch(
            scanJob
          );

        results.push(scanResult);

        executedJobs++;

      }

      /**
       * Trading Engine
       */
      if (
        options.enableTrading !== false
      ) {

        const tradingJob =
          dispatcher.createJob(
            "RUN_ENGINE"
          );

        const tradingResult =
          await dispatcher.dispatch(
            tradingJob
          );

        results.push(
          tradingResult
        );

        executedJobs++;

      }

      const finished =
        Date.now();

      await recordLog(
                "SYSTEM",
        "success",
        "[Automation] Engine completed."
      );

      return {

        success: true,

        startedAt:
          new Date(
            started
          ).toISOString(),

        finishedAt:
          new Date(
            finished
          ).toISOString(),

        durationMs:
          finished - started,

        executedJobs,

        results,

      };

    } catch (error) {

      console.error(
        "[Automation Engine]",
        error
      );

      await recordLog(
                "SYSTEM",
        "danger",
        "[Automation] Engine failed."
      );

      const finished =
        Date.now();

      return {

        success: false,

        startedAt:
          new Date(
            started
          ).toISOString(),

        finishedAt:
          new Date(
            finished
          ).toISOString(),

        durationMs:
          finished - started,

        executedJobs,

        results,

      };

    }

  }

}

const automationEngine =
  new AutomationEngine();

export default automationEngine;
