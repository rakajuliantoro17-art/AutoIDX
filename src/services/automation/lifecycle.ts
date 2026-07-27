/**
==========================================================
AURA Trade OS
Automation Lifecycle Manager
Version : 0.0.8 Alpha
==========================================================
*/

import { recordLog } from "../firebase/logService";

export type AutomationState =
  | "STOPPED"
  | "STARTING"
  | "RUNNING"
  | "PAUSED"
  | "STOPPING"
  | "ERROR";

export interface LifecycleStatus {

  state: AutomationState;

  startedAt?: string;

  stoppedAt?: string;

  lastUpdated: string;

  reason?: string;

}

class AutomationLifecycle {

  private status: LifecycleStatus = {

    state: "STOPPED",

    lastUpdated: new Date().toISOString(),

  };

  /**
   * Mengambil status lifecycle saat ini
   */
  getStatus(): LifecycleStatus {

    return { ...this.status };

  }

  /**
   * Apakah engine sedang berjalan
   */
  isRunning(): boolean {

    return this.status.state === "RUNNING";

  }

  /**
   * Memulai engine
   */
  async start(): Promise<void> {

    if (this.isRunning()) {
      return;
    }

    this.status = {

      state: "STARTING",

      startedAt: new Date().toISOString(),

      lastUpdated: new Date().toISOString(),

    };

    await recordLog(
      "info",
      "[Lifecycle] Engine starting."
    );

    this.status.state = "RUNNING";

    this.status.lastUpdated =
      new Date().toISOString();

    await recordLog(
      "success",
      "[Lifecycle] Engine running."
    );

  }

  /**
   * Pause engine
   */
  async pause(
    reason = "Paused manually."
  ): Promise<void> {

    this.status.state = "PAUSED";

    this.status.reason = reason;

    this.status.lastUpdated =
      new Date().toISOString();

    await recordLog(
      "warning",
      `[Lifecycle] ${reason}`
    );

  }

  /**
   * Resume engine
   */
  async resume(): Promise<void> {

    this.status.state = "RUNNING";

    this.status.reason = undefined;

    this.status.lastUpdated =
      new Date().toISOString();

    await recordLog(
      "success",
      "[Lifecycle] Engine resumed."
    );

  }

  /**
   * Stop engine
   */
  async stop(
    reason = "Stopped normally."
  ): Promise<void> {

    this.status.state = "STOPPING";

    this.status.lastUpdated =
      new Date().toISOString();

    await recordLog(
      "warning",
      "[Lifecycle] Engine stopping."
    );

    this.status.state = "STOPPED";

    this.status.reason = reason;

    this.status.stoppedAt =
      new Date().toISOString();

    this.status.lastUpdated =
      new Date().toISOString();

    await recordLog(
      "info",
      `[Lifecycle] ${reason}`
    );

  }

  /**
   * Tandai engine mengalami error
   */
  async setError(
    reason: string
  ): Promise<void> {

    this.status.state = "ERROR";

    this.status.reason = reason;

    this.status.lastUpdated =
      new Date().toISOString();

    await recordLog(
      "danger",
      `[Lifecycle] ${reason}`
    );

  }

  /**
   * Reset lifecycle
   */
  async reset(): Promise<void> {

    this.status = {

      state: "STOPPED",

      lastUpdated:
        new Date().toISOString(),

    };

    await recordLog(
      "info",
      "[Lifecycle] Reset completed."
    );

  }

}

const automationLifecycle =
  new AutomationLifecycle();

export default automationLifecycle;
