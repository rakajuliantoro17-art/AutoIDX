import type { ExchangeClient } from "../exchange/exchangeClient";
import { IndodaxExchangeClient } from "../exchange/indodaxAdapter";
import type { LiveTradingConfig } from "./liveTradingConfig";
import { LiveApproval } from "../gate/liveApproval";
import { KillSwitch } from "../gate/killSwitch";
import { LiveTradingGuard } from "../gate/liveTradingGuard";
import { LiveOrderGate } from "../gate/liveOrderGate";
import { OrderIdempotency } from "../execution/orderIdempotency";
import { ExecutionReconciler } from "../execution/executionReconciler";
import { LiveOrderExecutor } from "../execution/liveOrderExecutor";
import { LiveTradingRunner } from "./liveTradingRunner";

export class LiveTradingEngine {
  readonly approval: LiveApproval;
  readonly killSwitch: KillSwitch;
  readonly guard: LiveTradingGuard;
  readonly gate: LiveOrderGate;
  readonly idempotency: OrderIdempotency;
  readonly reconciler: ExecutionReconciler;
  readonly executor: LiveOrderExecutor;
  readonly runner: LiveTradingRunner;

  constructor(config: LiveTradingConfig, client: ExchangeClient = new IndodaxExchangeClient()) {
    this.approval = new LiveApproval();
    this.killSwitch = new KillSwitch(config.killSwitchEnabled);
    this.guard = new LiveTradingGuard(config, this.approval, this.killSwitch);
    this.gate = new LiveOrderGate(this.guard);
    this.idempotency = new OrderIdempotency();
    this.reconciler = new ExecutionReconciler(client);
    this.executor = new LiveOrderExecutor(client, this.idempotency, this.reconciler, config.orderTimeoutMs);
    this.runner = new LiveTradingRunner(config, this.gate, this.executor);
  }

  approveLive(operator: string): void { this.approval.approve(operator); }
  revokeLive(): void { this.approval.revoke(); }
  activateKillSwitch(reason: string): void { this.killSwitch.activate(reason); }
  resetKillSwitch(operator: string): void { this.killSwitch.reset(operator); }
}
