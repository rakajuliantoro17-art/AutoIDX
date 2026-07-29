/**
==========================================================
AURA Trade OS
Base Exchange Adapter
Version : 0.1.2 Alpha
==========================================================
*/

import type { ExchangeAccount } from "../models/account";
import type { AccountBalance } from "../models/balance";
import type { Order, OrderStatus } from "../models/order";
import type { Trade } from "../models/trade";

export interface ExchangeInfo {
  id: string;
  name: string;
  version: string;
  sandbox: boolean;
}

export interface ExchangeCapabilities {
  publicApi: boolean;
  privateApi: boolean;
  websocketMarket: boolean;
  websocketPrivate: boolean;
  ohlcv: boolean;
  orderBook: boolean;
  trades: boolean;
  ticker: boolean;
  paperTrading: boolean;
}

export interface ExchangeHealth {
  healthy: boolean;
  latency: number;
  message: string;
}

/**
 * Error yang dilempar oleh method operasional
 * (private API) yang belum diimplementasikan
 * secara nyata untuk exchange tertentu.
 */
export class AdapterNotImplementedError extends Error {
  constructor(exchangeId: string, method: string) {
    super(
      `[${exchangeId}] Method '${method}' belum diimplementasikan.`
    );
    this.name = "AdapterNotImplementedError";
  }
}

export interface IExchangeAdapter {

  readonly info: ExchangeInfo;
  readonly capabilities: ExchangeCapabilities;
  readonly id: string;
  readonly name: string;

  initialize(): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  health(): Promise<ExchangeHealth>;

  // -- Auth --
  validateCredential(): Promise<boolean>;

  // -- Account & Balance --
  getAccount(): Promise<ExchangeAccount>;
  getBalance(): Promise<AccountBalance>;

  // -- Orders --
  placeOrder(order: Order): Promise<Order>;
  getOrder(orderId: string): Promise<Order>;
  getOpenOrders(): Promise<Order[]>;
  getOrderHistory(symbol?: string): Promise<Order[]>;
  cancelOrder(orderId: string): Promise<boolean>;
  cancelAllOrders(symbol?: string): Promise<number>;

  // -- Trades --
  getTrade(tradeId: string): Promise<Trade>;
  getTradeHistory(symbol?: string): Promise<Trade[]>;
  getTradesByOrder(orderId: string): Promise<Trade[]>;

}

export abstract class BaseExchangeAdapter
implements IExchangeAdapter {

  abstract readonly info: ExchangeInfo;
  abstract readonly capabilities: ExchangeCapabilities;

  abstract initialize(): Promise<void>;
  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract health(): Promise<ExchangeHealth>;

  /**
   * Convenience helper.
   */
  get id(): string {
    return this.info.id;
  }

  /**
   * Convenience helper.
   */
  get name(): string {
    return this.info.name;
  }

  /**
   * Check whether the exchange
   * supports a capability.
   */
  supports(
    capability: keyof ExchangeCapabilities
  ): boolean {
    return this.capabilities[capability];
  }

  /**
   * ================================================
   * Default implementations untuk method operasional
   * (private API). Sengaja melempar error yang jelas
   * alih-alih pura-pura berhasil, mengikuti prinsip
   * project ini: jangan berpura-pura sudah ada.
   *
   * Setiap adapter exchange nyata (mis. IndodaxAdapter)
   * WAJIB override method ini satu per satu begitu
   * integrasi private API-nya benar-benar siap.
   * ================================================
   */

  async validateCredential(): Promise<boolean> {
    throw new AdapterNotImplementedError(this.id, "validateCredential");
  }

  async getAccount(): Promise<ExchangeAccount> {
    throw new AdapterNotImplementedError(this.id, "getAccount");
  }

  async getBalance(): Promise<AccountBalance> {
    throw new AdapterNotImplementedError(this.id, "getBalance");
  }

  async placeOrder(_order: Order): Promise<Order> {
    throw new AdapterNotImplementedError(this.id, "placeOrder");
  }

  async getOrder(_orderId: string): Promise<Order> {
    throw new AdapterNotImplementedError(this.id, "getOrder");
  }

  async getOpenOrders(): Promise<Order[]> {
    throw new AdapterNotImplementedError(this.id, "getOpenOrders");
  }

  async getOrderHistory(_symbol?: string): Promise<Order[]> {
    throw new AdapterNotImplementedError(this.id, "getOrderHistory");
  }

  async cancelOrder(_orderId: string): Promise<boolean> {
    throw new AdapterNotImplementedError(this.id, "cancelOrder");
  }

  async cancelAllOrders(_symbol?: string): Promise<number> {
    throw new AdapterNotImplementedError(this.id, "cancelAllOrders");
  }

  async getTrade(_tradeId: string): Promise<Trade> {
    throw new AdapterNotImplementedError(this.id, "getTrade");
  }

  async getTradeHistory(_symbol?: string): Promise<Trade[]> {
    throw new AdapterNotImplementedError(this.id, "getTradeHistory");
  }

  async getTradesByOrder(_orderId: string): Promise<Trade[]> {
    throw new AdapterNotImplementedError(this.id, "getTradesByOrder");
  }

}
