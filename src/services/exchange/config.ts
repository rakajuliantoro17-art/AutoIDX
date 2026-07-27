/**
==========================================================
AURA Trade OS
Exchange Configuration
Version : 0.1.1 Alpha
==========================================================
*/

import type {

    ExchangeConfig,

} from "./types";

export const DEFAULT_TIMEOUT = 10000;

export const DEFAULT_RETRY = 3;

export const DEFAULT_CACHE_TTL = 5000;

export const DEFAULT_RATE_LIMIT = 10;

export const EXCHANGE_CONFIG: Record<string, ExchangeConfig> = {

    INDODAX: {

        exchange: "INDODAX",

        baseUrl: "https://indodax.com/api",

        websocketUrl: "",

        timeout: DEFAULT_TIMEOUT,

    },

    BINANCE: {

        exchange: "BINANCE",

        baseUrl: "https://api.binance.com",

        websocketUrl: "wss://stream.binance.com:9443/ws",

        timeout: DEFAULT_TIMEOUT,

    },

    BYBIT: {

        exchange: "BYBIT",

        baseUrl: "https://api.bybit.com",

        websocketUrl: "wss://stream.bybit.com/v5/public",

        timeout: DEFAULT_TIMEOUT,

    },

    OKX: {

        exchange: "OKX",

        baseUrl: "https://www.okx.com",

        websocketUrl: "wss://ws.okx.com:8443/ws/v5/public",

        timeout: DEFAULT_TIMEOUT,

    },

    PAPER: {

        exchange: "PAPER",

        baseUrl: "",

        websocketUrl: "",

        timeout: DEFAULT_TIMEOUT,

    },

};

export default EXCHANGE_CONFIG;
