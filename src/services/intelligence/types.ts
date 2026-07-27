/**
==========================================================
AURA Trade OS
Intelligence Layer Types
Version : 0.1.0 Alpha
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

export type MarketMomentum =
  | "WEAK"
  | "NORMAL"
  | "STRONG";

export type LiquidityLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type TradingSignal =
  | "STRONG_BUY"
  | "BUY"
  | "HOLD"
  | "SELL"
  | "STRONG_SELL";

export interface FeatureVector {

  pair: string;

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

  volatility: MarketVolatility;

  momentum: MarketMomentum;

  liquidity: LiquidityLevel;

  confidence: number;

  timestamp: string;

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

export interface FusionDecision {

  pair: string;

  finalSignal: TradingSignal;

  confidence: number;

  scannerScore: number;

  aiScore: number;

  riskScore: number;

  portfolioScore: number;

  explanation: string[];

  timestamp: string;

}

export interface IntelligenceResult {

  pair: string;

  features: FeatureVector;

  context: MarketContext;

  ai: AIAnalysis;

  decision: FusionDecision;

}

export interface AIRequest {

  pair: string;

  featureVector: FeatureVector;

  context: MarketContext;

}

export interface AIResponse {

  success: boolean;

  data?: AIAnalysis;

  error?: string;

}

export interface IntelligenceConfig {

  enableAI: boolean;

  enableContextEngine: boolean;

  enableFeatureEngineering: boolean;

  minimumConfidence: number;

}
