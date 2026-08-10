/**
 * AURA Trade OS — Phase 35
 */
import type { PaperOrderSide } from "./paperOrder";

export interface PaperSlippage {
  apply(price: number, side: PaperOrderSide): number;
}

export class PercentagePaperSlippage implements PaperSlippage {
  constructor(private readonly rate: number) {
    if (rate < 0 || !Number.isFinite(rate)) throw new Error("Invalid slippage rate");
  }

  apply(price: number, side: PaperOrderSide): number {
    return side === "BUY" ? price * (1 + this.rate) : price * (1 - this.rate);
  }
}
