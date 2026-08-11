export class KillSwitch {
  private active: boolean;
  private reason?: string;
  private activatedAt?: number;

  constructor(enabled = true) {
    this.active = enabled;
    if (enabled) {
      this.reason = "Kill switch enabled by default";
      this.activatedAt = Date.now();
    }
  }

  activate(reason: string): void {
    this.active = true;
    this.reason = reason || "Manual kill switch";
    this.activatedAt = Date.now();
  }

  reset(operator: string): void {
    if (!operator.trim()) throw new Error("operator is required");
    this.active = false;
    this.reason = undefined;
    this.activatedAt = undefined;
  }

  isActive(): boolean { return this.active; }

  snapshot() {
    return Object.freeze({ active: this.active, reason: this.reason, activatedAt: this.activatedAt });
  }
}
