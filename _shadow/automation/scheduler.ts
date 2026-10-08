/**
==========================================================
AURA Trade OS
Automation Scheduler
Version : 0.0.8 Alpha
==========================================================
*/

import automationEngine from "./engine";
import automationLifecycle from "./lifecycle";
import { recordLog } from "../firebase/logService";

export interface SchedulerOptions {

  /**
   * Interval eksekusi (ms)
   * Default: 5 menit
   */
  intervalMs?: number;

  /**
   * Pair yang dipantau
   */
  pairs?: string[];

}

export interface SchedulerStatus {

  running: boolean;

  intervalMs: number;

  lastRun?: string;

  nextRun?: string;

  executions: number;

}

export class AutomationScheduler {

  private timer: NodeJS.Timeout | null = null;

  private executions = 0;

  private lastRun?: string;

  private intervalMs = 300000;

  /**
   * Start Scheduler
   */
  async start(
    options: SchedulerOptions = {}
  ): Promise<void> {

    if (this.timer) {

      await recordLog(
                "SYSTEM",
        "warning",
        "[Scheduler] Already running."
      );

      return;

    }

    this.intervalMs =
      options.intervalMs ??
      this.intervalMs;

    await automationLifecycle.start();

    await recordLog(
            "SYSTEM",
      "success",
      `[Scheduler] Started (${this.intervalMs} ms).`
    );

    this.timer = setInterval(
      async () => {

        await this.execute(options);

      },
      this.intervalMs
    );

    // Jalankan sekali saat start
    await this.execute(options);

  }

  /**
   * Stop Scheduler
   */
  async stop(): Promise<void> {

    if (!this.timer) {

      return;

    }

    clearInterval(this.timer);

    this.timer = null;

    await automationLifecycle.stop(
      "Scheduler stopped."
    );

    await recordLog(
            "SYSTEM",
      "warning",
      "[Scheduler] Stopped."
    );

  }

  /**
   * Pause Scheduler
   */
  async pause(): Promise<void> {

    if (!this.timer) {

      return;

    }

    clearInterval(this.timer);

    this.timer = null;

    await automationLifecycle.pause(
      "Scheduler paused."
    );

    await recordLog(
            "SYSTEM",
      "warning",
      "[Scheduler] Paused."
    );

  }

  /**
   * Resume Scheduler
   */
  async resume(
    options: SchedulerOptions = {}
  ): Promise<void> {

    if (this.timer) {

      return;

    }

    await automationLifecycle.resume();

    this.timer = setInterval(
      async () => {

        await this.execute(options);

      },
      this.intervalMs
    );

    await recordLog(
            "SYSTEM",
      "success",
      "[Scheduler] Resumed."
    );

  }

  /**
   * Jalankan satu siklus Automation
   */
  private async execute(
    options: SchedulerOptions
  ): Promise<void> {

    try {

      this.executions++;

      this.lastRun =
        new Date().toISOString();

      await automationEngine.run({

        pairs: options.pairs,

        enableHeartbeat: true,

        enableScanner: true,

        enableTrading: true,

      });

      await recordLog(
                "SYSTEM",
        "success",
        `[Scheduler] Cycle #${this.executions} completed.`
      );

    } catch (error) {

      console.error(
        "[Automation Scheduler]",
        error
      );

      await automationLifecycle.setError(
        "Scheduler execution failed."
      );

      await recordLog(
                "SYSTEM",
        "danger",
        "[Scheduler] Execution failed."
      );

    }

  }

  /**
   * Status Scheduler
   */
  getStatus(): SchedulerStatus {

    return {

      running:
        this.timer !== null,

      intervalMs:
        this.intervalMs,

      lastRun:
        this.lastRun,

      nextRun:
        this.timer
          ? new Date(
              Date.now() +
                this.intervalMs
            ).toISOString()
          : undefined,

      executions:
        this.executions,

    };

  }

}

const automationScheduler =
  new AutomationScheduler();

export default automationScheduler;
