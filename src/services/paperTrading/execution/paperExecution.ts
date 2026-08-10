/**
 * AURA Trade OS — Phase 35
 * This class deliberately has NO exchange/private API dependency.
 */
import type { MarketTick } from "../market/marketTick";
import { createPaperFill, type PaperFill } from "./paperFill";
import type { PaperOrder } from "./paperOrder";
import type { PaperSlippage } from "./paperSlippage";

export class PaperExecution {
  constructor(
    private readonly feeRate: number,
    private readonly slippage: PaperSlippage,
  ) {}

  execute(order: PaperOrder, tick: MarketTick): PaperFill {
    const reference = order.side === "BUY" ? tick.ask : tick.bid;
    const price = this.slippage.apply(reference, order.side);
    return createPaperFill(order, price, this.feeRate, tick.timestamp);
  }
}
