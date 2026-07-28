/**
==========================================================
AURA Trade OS
Intelligence Layer Entry
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
Core
==========================================================
*/

export {

    default as intelligenceManager

}

from "./manager";



export {

    default as intelligenceRegistry

}

from "./registry";



/**
==========================================================
Types
==========================================================
*/

export type {

    IntelligenceProvider,

    IntelligenceCategory,

    IntelligenceStatus,

    IntelligenceSnapshot,

    MarketSnapshot,

    MarketTrend,

    MarketVolatility,

    LiquidityLevel,

    PortfolioSnapshot,

    PortfolioAsset,

    SentimentSnapshot,

    NewsSnapshot,

    NewsItem,

    OnChainSnapshot,

    SocialSnapshot,

    MarketFilterResult,

    ProviderHealth,

    IntelligenceHealthReport,

    IntelligenceCacheEntry,

}

from "./types";



/**
==========================================================
Aggregators
==========================================================
*/

export {

    default as marketAggregator

}

from "./aggregators/marketAggregator";



export {

    default as portfolioAggregator

}

from "./aggregators/portfolioAggregator";



export {

    default as sentimentAggregator

}

from "./aggregators/sentimentAggregator";



/**
==========================================================
Cache
==========================================================
*/

export {

    default as intelligenceCache

}

from "./cache/intelligenceCache";



/**
==========================================================
Filters
==========================================================
*/

export {

    default as marketFilter

}

from "./filters/marketFilter";



/**
==========================================================
Health
==========================================================
*/

export {

    default as intelligenceHealth

}

from "./health/health";
