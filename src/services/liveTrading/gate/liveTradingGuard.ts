import type { LiveTradingConfig } from "../engine/liveTradingConfig";
import type { LiveTradingContext } from "../engine/liveTradingContext";
import { LiveApproval } from "./liveApproval";
import { KillSwitch } from "./killSwitch";

export class LiveTradingGuard {
  constructor(
    private readonly config: LiveTradingConfig,
    private readonly approval: LiveApproval,
    private readonly killSwitch: KillSwitch,
  ) {}

  check(context: LiveTradingContext): { allowed: boolean; reason?: string } {
    if (context.signal === "HOLD") return { allowed: false, reason: "HOLD signal" };
    if (!this.config.enabled) return { allowed: false, reason: "Live trading disabled" };
    if (this.config.dryRun) return { allowed: false, reason: "Live trading dry-run enabled" };
    if (this.killSwitch.isActive()) return { allowed: false, reason: "Kill switch active" };
    if (!this.approval.isApproved()) return { allowed: false, reason: "Live trading not approved" };
    if (context.quantity <= 0 || context.referencePrice <= 0) return { allowed: false, reason: "Invalid order values" };

    const notional = context.quantity * context.referencePrice;
    if (notional < this.config.minOrderNotional) return { allowed: false, reason: "Order below minimum notional" };
    if (notional > this.config.maxOrderNotional) return { allowed: false, reason: "Order exceeds maximum notional" };
    return { allowed: true };
  }
}
