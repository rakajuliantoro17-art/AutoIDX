/**
==========================================================
AURA Trade OS
Exchange Cache Gateway
Version : 0.1.1 Alpha
==========================================================
*/

/*
==========================================================
Individual Cache Exports
==========================================================
*/

export { default as pairCache } from "./pairCache";
export { default as tickerCache } from "./tickerCache";
export { default as orderBookCache } from "./orderBookCache";
export { default as marketCache } from "./marketCache";

/*
==========================================================
Type Exports
==========================================================
*/

export type {
  CachedPair,
  PairCache,
} from "./pairCache";

export type {
  CachedTicker,
  TickerCache,
} from "./tickerCache";

export type {
  CachedOrderBook,
  OrderBookCache,
} from "./orderBookCache";

export type {
  MarketSnapshot,
  MarketCache,
} from "./marketCache";

/*
==========================================================
Convenience Export
==========================================================
*/

export const exchangeCache = {

  pair: pairCache,

  ticker: tickerCache,

  orderBook: orderBookCache,

  market: marketCache,

} as const;

export default exchangeCache;
