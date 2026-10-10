export type LifecycleState =
  | "CREATED"
  | "STARTING"
  | "RUNNING"
  | "STOPPING"
  | "STOPPED";

export class IntegrationLifecycle {
  private state: LifecycleState =
    "CREATED";

  start(): void {
    if (
      this.state !== "CREATED" &&
      this.state !== "STOPPED"
    ) {
      return;
    }

    this.state = "STARTING";
    this.state = "RUNNING";
  }

  stop(): void {
    if (this.state !== "RUNNING") {
      return;
    }

    this.state = "STOPPING";
    this.state = "STOPPED";
  }

  getState(): LifecycleState {
    return this.state;
  }

  isRunning(): boolean {
    return this.state === "RUNNING";
  }
}
