/**
==========================================================
AURA Trade OS
Exchange Cache Gateway
Version : 0.1.2 Alpha
==========================================================
*/

/*
==========================================================
Individual Cache Imports (untuk dipakai di file ini)
==========================================================
*/
import pairCache from "./pairCache";
import tickerCache from "./tickerCache";
import orderBookCache from "./orderBookCache";
import marketCache from "./marketCache";

/*
==========================================================
Individual Cache Exports (untuk dipakai file lain)
==========================================================
*/
export {
  pairCache,
  tickerCache,
  orderBookCache,
  marketCache,
};

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
