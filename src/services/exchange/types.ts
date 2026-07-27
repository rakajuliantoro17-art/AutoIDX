/**
==========================================================
AURA Trade OS
Exchange Shared Types
Version : 0.1.1 Alpha
==========================================================
*/

export type ExchangeName =

    | "INDODAX"
    | "BINANCE"
    | "BYBIT"
    | "OKX"
    | "PAPER";

export type MarketType =

    | "SPOT"
    | "FUTURES"
    | "MARGIN";

export type OrderSide =

    | "BUY"
    | "SELL";

export type OrderType =

    | "MARKET"
    | "LIMIT"
    | "STOP"
    | "STOP_LIMIT";

export type TimeInForce =

    | "GTC"
    | "IOC"
    | "FOK";

export type PositionSide =

    | "LONG"
    | "SHORT"
    | "NONE";

export type ConnectionStatus =

    | "DISCONNECTED"
    | "CONNECTING"
    | "CONNECTED"
    | "RECONNECTING"
    | "ERROR";

export type SubscriptionType =

    | "TICKER"
    | "TRADES"
    | "ORDERBOOK"
    | "OHLCV"
    | "ACCOUNT";

export interface Pagination {

    page: number;

    limit: number;

}

export interface DateRange {

    from?: number;

    to?: number;

}

export interface ApiResponse<T> {

    success: boolean;

    data: T;

    message?: string;

    timestamp: number;

}

export interface ExchangeConfig {

    exchange: ExchangeName;

    baseUrl: string;

    websocketUrl?: string;

    timeout: number;

}

export interface Credentials {

    apiKey: string;

    apiSecret: string;

}

export interface Subscription {

    type: SubscriptionType;

    symbol: string;

    interval?: string;

}

export type EventHandler<T> =

    (event: T) => void;

export type Nullable<T> =

    T | null;

export type Optional<T> =

    T | undefined;

export type Dictionary<T> =

    Record<string, T>;
