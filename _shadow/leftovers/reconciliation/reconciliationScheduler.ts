export type ReconciliationJob =
  () => Promise<void>;

export class ReconciliationScheduler {
  private timer?:
    ReturnType<typeof setInterval>;

  private running = false;

  constructor(
    private readonly intervalMs: number,
    private readonly job: ReconciliationJob,
  ) {
    if (intervalMs <= 0) {
      throw new Error(
        "intervalMs must be greater than zero",
      );
    }
  }

  start(): void {
    if (this.timer) return;

    this.timer = setInterval(
      () => void this.run(),
      this.intervalMs,
    );
  }

  async run(): Promise<void> {
    if (this.running) return;

    this.running = true;

    try {
      await this.job();
    } finally {
      this.running = false;
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.timer = undefined;
  }

  isRunning(): boolean {
    return Boolean(this.timer);
  }
}
