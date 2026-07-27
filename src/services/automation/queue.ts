/**
==========================================================
AURA Trade OS
Automation Queue Manager
Version : 0.0.8 Alpha
==========================================================
*/

import dispatcher, {
  DispatchJob,
  DispatchResult,
} from "./dispatcher";

import { recordLog } from "../firebase/logService";

export interface QueueStatistics {

  total: number;

  pending: number;

  processing: boolean;

  completed: number;

  failed: number;

}

export class AutomationQueue {

  private queue: DispatchJob[] = [];

  private processing = false;

  private completed = 0;

  private failed = 0;

  /**
   * Tambahkan job ke antrean
   */
  enqueue(job: DispatchJob): number {

    this.queue.push(job);

    return this.queue.length;

  }

  /**
   * Ambil job pertama
   */
  dequeue(): DispatchJob | undefined {

    return this.queue.shift();

  }

  /**
   * Lihat job pertama
   */
  peek(): DispatchJob | undefined {

    return this.queue[0];

  }

  /**
   * Jumlah job
   */
  size(): number {

    return this.queue.length;

  }

  /**
   * Queue kosong?
   */
  isEmpty(): boolean {

    return this.queue.length === 0;

  }

  /**
   * Hapus semua antrean
   */
  clear(): void {

    this.queue = [];

  }

  /**
   * Statistik Queue
   */
  getStatistics(): QueueStatistics {

    return {

      total:
        this.completed +
        this.failed +
        this.queue.length,

      pending:
        this.queue.length,

      processing:
        this.processing,

      completed:
        this.completed,

      failed:
        this.failed,

    };

  }

  /**
   * Proses seluruh antrean
   */
  async process(): Promise<DispatchResult[]> {

    if (this.processing) {

      await recordLog(
        "warning",
        "[Queue] Already processing."
      );

      return [];

    }

    this.processing = true;

    const results: DispatchResult[] = [];

    await recordLog(
      "info",
      `[Queue] Processing ${this.queue.length} job(s).`
    );

    while (!this.isEmpty()) {

      const job = this.dequeue();

      if (!job) {
        continue;
      }

      try {

        const result =
          await dispatcher.dispatch(job);

        results.push(result);

        if (result.success) {

          this.completed++;

        } else {

          this.failed++;

        }

      } catch (error) {

        this.failed++;

        console.error(
          "[Queue]",
          error
        );

      }

    }

    this.processing = false;

    await recordLog(
      "success",
      "[Queue] Processing completed."
    );

    return results;

  }

  /**
   * Membuat job dan langsung memasukkan ke antrean
   */
  push(

    type: DispatchJob["type"],

    payload?: Record<string, unknown>

  ): number {

    const job =
      dispatcher.createJob(
        type,
        payload
      );

    return this.enqueue(job);

  }

}

const automationQueue =
  new AutomationQueue();

export default automationQueue;
