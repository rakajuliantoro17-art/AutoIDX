/**
 * AURA Trade OS — Phase 35
 */
import type { MarketTick } from "../market/marketTick";
import { RealtimeMarket } from "../market/realtimeMarket";
import type { PaperTradingConfig } from "./paperTradingConfig";
import type { PaperStrategy } from "./paperTradingContext";
import { PaperExecution } from "../execution/paperExecution";
import { PercentagePaperSlippage } from "../execution/paperSlippage";
import { createPaperOrder } from "../execution/paperOrder";
import { PaperPortfolio } from "../portfolio/paperPortfolio";
import { PaperTradeLog } from "../monitoring/paperTradeLog";
import { PaperHealthMonitor } from "../monitoring/paperHealth";
import { calculatePaperMetrics, type PaperMetrics } from "../monitoring/paperMetrics";
import type { PaperTradeRecord } from "../monitoring/paperTradeLog";

export class PaperTradingRunner {
  readonly market = new RealtimeMarket();
  readonly portfolio: PaperPortfolio;
  readonly tradeLog = new PaperTradeLog();
  readonly health = new PaperHealthMonitor();
  private readonly execution: PaperExecution;
  private readonly history: MarketTick[] = [];
  private openEntry?: { id: string; price: number; quantity: number; timestamp: number };

  constructor(
    private readonly config: PaperTradingConfig,
    private readonly strategy: PaperStrategy,
  ) {
    this.portfolio = new PaperPortfolio(config.initialCapital);
    this.execution = new PaperExecution(
      config.feeRate,
      new PercentagePaperSlippage(config.slippageRate),
    );
  }

  async onTick(tick: MarketTick): Promise<void> {
    if (this.health.snapshot().status === "PAUSED" || this.health.snapshot().status === "ERROR") return;

    this.market.update(tick);
    this.health.tick(Date.now());

    if (this.market.isStale(tick.symbol, Date.now(), this.config.staleMarketMs)) return;

    const signal = await this.strategy.evaluate({
      tick,
      history: this.history,
      portfolio: this.portfolio,
    });

    if (signal === "BUY" && !this.openEntry) {
      const quantity = this.buyQuantity(tick);
      if (quantity > 0) {
        const order = createPaperOrder({
          symbol: tick.symbol,
          side: "BUY",
          type: "MARKET",
          quantity,
          createdAt: tick.timestamp,
        });
        const fill = this.execution.execute(order, tick);
        this.portfolio.apply(fill);
        this.openEntry = {
          id: fill.id,
          price: fill.price,
          quantity: fill.quantity,
          timestamp: fill.timestamp,
        };
      }
    } else if (signal === "SELL" && this.openEntry) {
      const position = this.portfolio.getPositions().find(p => p.symbol === tick.symbol);
      const quantity = Math.min(this.openEntry.quantity, position?.quantity ?? 0);
      if (quantity > 0) {
        const order = createPaperOrder({
          symbol: tick.symbol,
          side: "SELL",
          type: "MARKET",
          quantity,
          createdAt: tick.timestamp,
        });
        const fill = this.execution.execute(order, tick);
        this.portfolio.apply(fill);

        const pnl = (fill.price - this.openEntry.price) * fill.quantity - fill.fee;
        const record: PaperTradeRecord = {
          id: this.openEntry.id,
          symbol: tick.symbol,
          side: "LONG",
          entryPrice: this.openEntry.price,
          exitPrice: fill.price,
          quantity: fill.quantity,
          pnl,
          returnPercent: this.openEntry.price ? fill.price / this.openEntry.price - 1 : 0,
          entryTime: this.openEntry.timestamp,
          exitTime: fill.timestamp,
        };
        this.tradeLog.add(record);
        this.openEntry = undefined;
      }
    }

    this.portfolio.snapshot({ [tick.symbol]: tick.last }, tick.timestamp);
    this.history.push(tick);
    if (this.history.length > 500) this.history.shift();

    this.enforceDailyLoss();
  }

  pause(): void { this.health.pause(); }
  stop(): void { this.health.stop(); }

  metrics(): PaperMetrics {
    return calculatePaperMetrics(
      this.config.initialCapital,
      this.portfolio.getSnapshots(),
      this.tradeLog.all(),
    );
  }

  private buyQuantity(tick: MarketTick): number {
    const equity = this.portfolio.getSnapshots().at(-1)?.equity ?? this.config.initialCapital;
    const maxNotional = Math.min(
      equity * this.config.maxPositionSize,
      this.config.maxOrderNotional,
    );
    if (maxNotional < this.config.minOrderNotional) return 0;
    const quantity = maxNotional / tick.ask;
    return quantity > 0 ? quantity : 0;
  }

  private enforceDailyLoss(): void {
    const snapshots = this.portfolio.getSnapshots();
    const latest = snapshots.at(-1);
    if (!latest) return;
    const dayStart = new Date(latest.timestamp);
    dayStart.setUTCHours(0, 0, 0, 0);
    const start = snapshots.find(s => s.timestamp >= dayStart.getTime());
    if (!start) return;
    const loss = (start.equity - latest.equity) / Math.max(start.equity, 1);
    if (loss >= this.config.maxDailyLoss) this.health.pause();
  }
}
