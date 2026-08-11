import type { LiveTradingContext } from "../engine/liveTradingContext";
import { LiveTradingGuard } from "./liveTradingGuard";

export class LiveOrderGate {
  constructor(private readonly guard: LiveTradingGuard) {}
  check(context: LiveTradingContext): { allowed: boolean; reason?: string } {
    return this.guard.check(context);
  }
}
