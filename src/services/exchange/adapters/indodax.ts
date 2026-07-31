/**
==========================================================
AURA Trade OS
Indodax Exchange Adapter
Version : 0.1.2 Alpha
==========================================================
*/

import {
  BaseExchangeAdapter,
  ExchangeCapabilities,
  AdapterHealthResult,
  ExchangeInfo,
} from "./base";
import publicClient from "../public/client";

export class IndodaxAdapter extends BaseExchangeAdapter {

  readonly info: ExchangeInfo = {
    id: "indodax",
    name: "Indodax",
    version: "2.0",
    sandbox: false,
  };

  readonly capabilities: ExchangeCapabilities = {
    publicApi: true,
    privateApi: true,
    websocketMarket: true,
    websocketPrivate: true,
    ohlcv: true,
    orderBook: true,
    trades: true,
    ticker: true,
    paperTrading: false,
  };

  /**
   * Initialize adapter
   */
  async initialize(): Promise<void> {
    await publicClient.initialize();
  }

  /**
   * Start adapter
   */
  async start(): Promise<void> {
    // WebSocket akan diaktifkan
    // pada Sprint berikutnya.
  }

  /**
   * Stop adapter
   */
  async stop(): Promise<void> {
    // Cleanup resource.
  }

  /**
   * Health Check
   */
  async health(): Promise<AdapterHealthResult> {
    const started = Date.now();
    try {
      await publicClient.serverTime();
      return {
        healthy: true,
        latency: Date.now() - started,
        message: "Indodax adapter operational.",
      };
    }
    catch (error) {
      return {
        healthy: false,
        latency: Date.now() - started,
        message:
          error instanceof Error
            ? error.message
            : "Unknown exchange error.",
      };
    }
  }

}

const indodaxAdapter =
new IndodaxAdapter();

export default indodaxAdapter;
