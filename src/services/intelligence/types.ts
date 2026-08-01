/**
==========================================================
AURA Trade OS
Intelligence Layer Types
Version : 0.1.0 Alpha
==========================================================
*/


/**
==========================================================
Provider Category
==========================================================
*/

export type IntelligenceCategory =

    | "MARKET"

    | "PORTFOLIO"

    | "NEWS"

    | "SOCIAL"

    | "ONCHAIN"

    | "SENTIMENT";



/**
==========================================================
Provider Status
==========================================================
*/

export type IntelligenceStatus =

    | "ACTIVE"

    | "INACTIVE"

    | "ERROR"

    | "LIMITED";



/**
==========================================================
Intelligence Provider Contract
==========================================================
*/

export interface IntelligenceProvider {

    id:string;

    name:string;

    category:IntelligenceCategory;

    status:IntelligenceStatus;

    enabled:boolean;


    /**
     * Fetch external intelligence data.
     */
    fetch():

        Promise<unknown>;



    /**
     * Provider health check.
     */
    health():

        Promise<boolean>;

}



/**
==========================================================
Raw Intelligence Snapshot
==========================================================
*/

export interface IntelligenceSnapshot {

    timestamp:number;


    providers:

        Record<

            string,

            unknown

        >;

}



/**
==========================================================
Market Intelligence
==========================================================
*/


export type MarketTrend =

    | "BULLISH"

    | "BEARISH"

    | "SIDEWAYS";



export type MarketVolatility =

    | "LOW"

    | "MEDIUM"

    | "HIGH";



export type LiquidityLevel =

    | "LOW"

    | "MEDIUM"

    | "HIGH";



export interface MarketSnapshot {


    timestamp:number;



    marketCap:

        number |

        null;



    btcDominance:

        number |

        null;



    fearGreed:

        number |

        null;



    totalVolume:

        number |

        null;



    trendingCoins:

        string[];



    trend?:

        MarketTrend;



    volatility?:

        MarketVolatility;



    liquidity?:

        LiquidityLevel;

    portfolioValue?:

        number |

        null;


    assets?:

        unknown[];


    providers:

        Record<

            string,

            boolean

        >;

}



/**
==========================================================
Portfolio Intelligence
==========================================================
*/


export interface PortfolioAsset {


    symbol:string;


    quantity:number;


    value?:number;


    averagePrice?:number;


    pnl?:number;

}



export interface PortfolioSnapshot {


    timestamp:number;


    totalValue:number;


    totalPnL:number;


    totalPnLPercent:number;



    assets:

        PortfolioAsset[];



    providers:

        Record<

            string,

            boolean

        >;

}



/**
==========================================================
Sentiment Intelligence
==========================================================
*/


export interface SentimentSnapshot {


    timestamp:number;



    fearGreed:

        number |

        null;



    newsSentiment:

        number |

        null;



    socialSentiment:

        number |

        null;



    onchainSentiment:

        number |

        null;



    overallScore:

        number |

        null;



    providers:

        Record<

            string,

            boolean

        >;

}



/**
==========================================================
News Intelligence
==========================================================
*/


export interface NewsItem {


    title:string;


    source:string;


    url?:string;


    sentiment?:

        number;



    publishedAt:

        number;

}



export interface NewsSnapshot {


    timestamp:number;


    items:

        NewsItem[];



    sentiment:

        number |

        null;

}



/**
==========================================================
On-chain Intelligence
==========================================================
*/


export interface OnChainSnapshot {


    timestamp:number;


    activeAddresses?:

        number;



    transactionVolume?:

        number;



    whaleActivity?:

        number;



    sentiment?:

        number;

}



/**
==========================================================
Social Intelligence
==========================================================
*/


export interface SocialSnapshot {


    timestamp:number;


    mentions?:

        number;



    engagement?:

        number;



    sentiment?:

        number;

}



/**
==========================================================
Market Filter Result
==========================================================
*/


export interface MarketFilterResult {


    passed:boolean;


    score:number;


    reasons:string[];

}



/**
==========================================================
Health Monitoring
==========================================================
*/


export interface ProviderHealth {


    providerId:string;


    healthy:boolean;


    latency:number;


    lastChecked:number;


    message:string;

}



export interface IntelligenceHealthReport {


    overallHealthy:boolean;


    checkedAt:number;


    providers:

        ProviderHealth[];

}



/**
==========================================================
Cache
==========================================================
*/


export interface IntelligenceCacheEntry<T>{


    value:T;


    expiresAt:number;

}

/**
==========================================================
AI Analyzer (rule-based scoring, bukan model ML terlatih)
==========================================================
*/

export type TradingSignal =
    | "STRONG_BUY"
    | "BUY"
    | "HOLD"
    | "SELL"
    | "STRONG_SELL";

export interface AIRequest {
    pair?: string;
    featureVector: FeatureVector;
    context: MarketContext;
}

export interface AIAnalysis {
    signal: TradingSignal;
    confidence: number;
    summary: string;
    reasoning: string[];
    risks: string[];
    recommendation: string;
    timestamp: string;
}

/**
==========================================================
Shared Feature Vector & Market Context
(dipakai lintas context/*, features/*, ai/*)
==========================================================
*/

export type MarketMomentum =
    | "STRONG"
    | "NORMAL"
    | "WEAK";

export interface FeatureVector {
    pair?: string;
    price: number;
    volume: number;
    emaFast: number;
    emaSlow: number;
    rsi: number;
    macd: number;
    macdSignal: number;
    macdHistogram: number;
    atr: number;
    adx: number;
    stochasticK: number;
    stochasticD: number;
    bollingerUpper: number;
    bollingerMiddle: number;
    bollingerLower: number;
}

export interface MarketContext {
    pair: string;
    trend: MarketTrend;
    momentum: MarketMomentum;
    volatility: MarketVolatility;
    liquidity: LiquidityLevel;
    confidence: number;
    timestamp: string;
}

/**
 * Alias -- FusionDecision merujuk ke DecisionFusionResult
 * (definisi asli ada di fusion/decision.ts).
 */
export type { DecisionFusionResult as FusionDecision } from "./fusion/decision";
