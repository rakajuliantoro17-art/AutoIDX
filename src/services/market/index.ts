/**
==========================================================
AURA Trade OS
Market Data Service Entry Point
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
WebSocket Layer
==========================================================
*/


export {

    default as indodaxSocket,

    IndodaxSocket

} from "./websocket/indodaxSocket";


export type {

    MarketTick,

    SocketConfig,

    SocketEvent

} from "./websocket/indodaxSocket";





export {

    default as marketSocketManager,

    MarketWebSocketManager

} from "./websocket/manager";


export type {

    ConnectionStatus,

    Subscription

} from "./websocket/manager";





/**
==========================================================
Candle Layer
==========================================================
*/


export {

    default as candleBuilder,

    CandleBuilder

} from "./candles/candleBuilder";


export type {

    Candle,

    CandleTimeframe

} from "./candles/candleBuilder";





/**
==========================================================
Order Book Layer
==========================================================
*/


export {

    default as orderBook,

    OrderBookEngine

} from "./orderbook/orderBook";


export type {

    OrderBookLevel,

    OrderBookSnapshot,

    OrderBookMetrics

} from "./orderbook/orderBook";





/**
==========================================================
Ticker Layer
==========================================================
*/


export {

    default as tickerService,

    TickerService

} from "./ticker/tickerService";


export type {

    TickerData,

    PriceUpdate

} from "./ticker/tickerService";

export * from "./types";
