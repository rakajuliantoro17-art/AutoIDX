/**
==========================================================
AURA Trade OS
Automation Worker
Version : 0.0.8 Alpha
==========================================================
*/

import automationQueue from "./queue";
import { DispatchResult } from "./dispatcher";
import { recordLog } from "../firebase/logService";

export type WorkerState =
  | "IDLE"
  | "RUNNING"
  | "STOPPED"
  | "ERROR";

export interface WorkerStatistics {

  id: string;

  state: WorkerState;

  processed: number;

  failed: number;

  startedAt?: string;

  lastJobAt?: string;

}

export class AutomationWorker {

  private readonly id: string;

  private state: WorkerState = "IDLE";

  private processed = 0;

  private failed = 0;

  private startedAt?: string;

  private lastJobAt?: string;

  constructor(id = "worker-1") {

    this.id = id;

  }

  /**
   * Jalankan Worker
   */
  async start(): Promise<DispatchResult[]> {

    if (this.state === "RUNNING") {

      await recordLog(
                "SYSTEM",
        "warning",
        `[Worker:${this.id}] Already running.`
      );

      return [];

    }

    this.state = "RUNNING";

    this.startedAt =
      new Date().toISOString();

    await recordLog(
            "SYSTEM",
      "info",
      `[Worker:${this.id}] Started.`
    );

    try {

      const results =
        await automationQueue.process();

      this.processed +=
        results.filter(
          item => item.success
        ).length;

      this.failed +=
        results.filter(
          item => !item.success
        ).length;

      this.lastJobAt =
        new Date().toISOString();

      this.state = "IDLE";

      await recordLog(
                "SYSTEM",
        "success",
        `[Worker:${this.id}] Queue completed.`
      );

      return results;

    } catch (error) {

      this.failed++;

      this.state = "ERROR";

      console.error(
        `[Worker:${this.id}]`,
        error
      );

      await recordLog(
                "SYSTEM",
        "danger",
        `[Worker:${this.id}] Failed.`
      );

      return [];

    }

  }

  /**
   * Stop Worker
   */
  async stop(): Promise<void> {

    this.state = "STOPPED";

    await recordLog(
            "SYSTEM",
      "warning",
      `[Worker:${this.id}] Stopped.`
    );

  }

  /**
   * Reset statistik Worker
   */
  reset(): void {

    this.processed = 0;

    this.failed = 0;

    this.startedAt = undefined;

    this.lastJobAt = undefined;

    this.state = "IDLE";

  }

  /**
   * Status Worker
   */
  getStatistics(): WorkerStatistics {

    return {

      id: this.id,

      state: this.state,

      processed: this.processed,

      failed: this.failed,

      startedAt: this.startedAt,

      lastJobAt: this.lastJobAt,

    };

  }

  /**
   * Apakah Worker sedang aktif
   */
  isRunning(): boolean {

    return this.state === "RUNNING";

  }

}

const automationWorker =
  new AutomationWorker();

export default automationWorker;
