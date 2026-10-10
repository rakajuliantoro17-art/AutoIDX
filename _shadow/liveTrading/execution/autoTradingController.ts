/**
 * ==========================================================
 * AutoIDX — Phase 38 Batch 10
 * Auto Trading Controller
 * ==========================================================
 */

import type {
  ExchangeClient,
} from "../exchange/exchangeClient";

import type {
  ExchangeOrderRequest,
  ExchangeOrder,
} from "../exchange/exchangeOrder";

import {
  createIdempotencyKey,
} from "../gate/idempotencyKey";

import {
  DuplicateOrderGuard,
} from "../gate/duplicateOrderGuard";

import {
  UncertainExecutionGuard,
} from "../gate/uncertainExecutionGuard";

import type {
  IdempotencyStore,
} from "../gate/idempotencyStore";

import {
  ExecutionPreflight,
} from "./executionPreflight";

import {
  KillSwitch,
} from "../monitor/killSwitch";

import {
  ProductionGate,
} from "../monitor/productionGate";

import {
  ExecutionSupervisor,
} from "./executionSupervisor";

export interface AutoTradeRequest
  extends ExchangeOrderRequest {
  readonly price: number;
  readonly balance: number;
  readonly maxTradeAmount: number;
  readonly minTradeAmount: number;
}

export interface AutoTradeResult {
  readonly success: boolean;
  readonly order?: ExchangeOrder;
  readonly blocked: boolean;
  readonly reason?: string;
  readonly idempotencyKey: string;
  readonly timestamp: number;
}

export class AutoTradingController {

  private readonly duplicateGuard:
    DuplicateOrderGuard;

  private readonly preflight:
    ExecutionPreflight;

  constructor(
    private readonly exchange:
      ExchangeClient,

    private readonly store:
      IdempotencyStore,

    private readonly uncertain:
      UncertainExecutionGuard,

    private readonly killSwitch:
      KillSwitch,

    private readonly productionGate:
      ProductionGate,

    private readonly supervisor:
      ExecutionSupervisor,
  ) {

    this.duplicateGuard =
      new DuplicateOrderGuard(
        store,
      );

    this.preflight =
      new ExecutionPreflight();
  }

  async execute(
    request: AutoTradeRequest,
  ): Promise<AutoTradeResult> {

    const key =
      createIdempotencyKey({
        symbol:
          request.symbol,

        side:
          request.side,

        quantity:
          request.quantity,

        quoteAmount:
          request.quoteAmount,
      });

    const blocked =
      this.block(
        key,
      );

    if (blocked) {
      return blocked;
    }

    const preflight =
      this.preflight.evaluate({
        symbol:
          request.symbol,

        side:
          request.side,

        quantity:
          request.quantity,

        price:
          request.price ??
          0,

        balance:
          request.balance,

        maxTradeAmount:
          request.maxTradeAmount,

        minTradeAmount:
          request.minTradeAmount,
      });

    if (!preflight.passed) {
      return this.result(
        key,
        false,
        preflight.failures.join(
          " | ",
        ),
      );
    }

    await this.store.put({
      key,
      status:
        "RESERVED",
      createdAt:
        Date.now(),
      updatedAt:
        Date.now(),
    });

    try {

      const order =
        await this.exchange.submitOrder(
          request,
        );

      await this.store.update(
        key,
        {
          status:
            "SUBMITTED",

          orderId:
            order.id,
        },
      );

      this.supervisor.success();

      return {
        success:
          true,

        order,

        blocked:
          false,

        idempotencyKey:
          key,

        timestamp:
          Date.now(),
      };

    } catch (error) {

      this.uncertain.markUncertain({
        key,

        symbol:
          request.symbol,

        side:
          request.side,

        createdAt:
          Date.now(),

        reason:
          error instanceof Error
            ? error.message
            : "Unknown exchange execution failure.",
      });

      await this.store.update(
        key,
        {
          status:
            "UNCERTAIN",
        },
      );

      this.supervisor.failure(
        "Exchange execution became uncertain.",
      );

      return this.result(
        key,
        false,
        "Execution became uncertain. Automatic retry is blocked until reconciliation.",
      );
    }
  }

  private block(
    key: string,
  ): AutoTradeResult | null {

    if (
      this.killSwitch.isActive()
    ) {
      return this.result(
        key,
        false,
        "Kill switch is active.",
      );
    }

    if (
      !this.productionGate.isUnlocked()
    ) {
      return this.result(
        key,
        false,
        "Production gate is locked.",
      );
    }

    if (
      !this.supervisor.canExecute()
    ) {
      return this.result(
        key,
        false,
        "Execution supervisor has blocked trading.",
      );
    }

    if (
      this.uncertain.isBlocked(key)
    ) {
      return this.result(
        key,
        false,
        "Previous execution is uncertain and requires reconciliation.",
      );
    }

    return null;
  }

  private result(
    key: string,
    success: boolean,
    reason: string,
  ): AutoTradeResult {

    return {
      success,
      blocked:
        !success,
      reason,
      idempotencyKey:
        key,
      timestamp:
        Date.now(),
    };
  }
}
