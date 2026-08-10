/**
 * AURA Trade OS — Phase 35
 * Virtual-only accounting. No exchange access.
 */
import type { PaperFill } from "../execution/paperFill";
import type { PaperPosition } from "./paperPosition";
import { unrealizedPnl } from "./paperPosition";
import type { PaperSnapshot } from "./paperSnapshot";

export class PaperPortfolio {
  private cash: number;
  private realized = 0;
  private readonly positions = new Map<string, PaperPosition>();
  private readonly snapshots: PaperSnapshot[] = [];

  constructor(private readonly initialCapital: number) {
    if (initialCapital <= 0) throw new Error("initialCapital must be > 0");
    this.cash = initialCapital;
  }

  apply(fill: PaperFill): void {
    const current = this.positions.get(fill.symbol);

    if (fill.side === "BUY") {
      if (this.cash + 1e-9 < -fill.netCashFlow) throw new Error("Insufficient paper cash");
      this.cash += fill.netCashFlow;

      if (!current) {
        this.positions.set(fill.symbol, {
          symbol: fill.symbol,
          quantity: fill.quantity,
          averageEntryPrice: fill.price,
          openedAt: fill.timestamp,
        });
        return;
      }

      const qty = current.quantity + fill.quantity;
      const cost = current.quantity * current.averageEntryPrice + fill.quantity * fill.price;
      this.positions.set(fill.symbol, {
        ...current,
        quantity: qty,
        averageEntryPrice: cost / qty,
      });
      return;
    }

    if (!current || fill.quantity > current.quantity + 1e-12) {
      throw new Error("Paper sell exceeds position");
    }

    this.cash += fill.netCashFlow;
    this.realized += (fill.price - current.averageEntryPrice) * fill.quantity - fill.fee;

    const remaining = current.quantity - fill.quantity;
    if (remaining <= 1e-12) this.positions.delete(fill.symbol);
    else this.positions.set(fill.symbol, { ...current, quantity: remaining });
  }

  snapshot(prices: Readonly<Record<string, number>>, timestamp: number): PaperSnapshot {
    let exposure = 0;
    let unrealized = 0;
    const positions = [...this.positions.values()];

    for (const position of positions) {
      const price = prices[position.symbol];
      if (price === undefined) continue;
      exposure += position.quantity * price;
      unrealized += unrealizedPnl(position, price);
    }

    const snapshot: PaperSnapshot = Object.freeze({
      timestamp,
      cash: this.cash,
      equity: this.cash + exposure,
      exposure,
      realizedPnl: this.realized,
      unrealizedPnl: unrealized,
      positions,
    });

    this.snapshots.push(snapshot);
    return snapshot;
  }

  getCash(): number { return this.cash; }
  getInitialCapital(): number { return this.initialCapital; }
  getPositions(): readonly PaperPosition[] { return [...this.positions.values()]; }
  getSnapshots(): readonly PaperSnapshot[] { return [...this.snapshots]; }
  getRealizedPnl(): number { return this.realized; }
}
