/**
==========================================================
AURA Trade OS
Base Exchange Adapter
Version : 0.1.1 Alpha
==========================================================
*/

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

export interface IExchangeAdapter {

  readonly info: ExchangeInfo;

  readonly capabilities: ExchangeCapabilities;

  initialize(): Promise<void>;

  start(): Promise<void>;

  stop(): Promise<void>;

  health(): Promise<ExchangeHealth>;

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

}
