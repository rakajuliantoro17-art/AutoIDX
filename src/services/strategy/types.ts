export type StrategyType = 'EMA_CROSSOVER' | 'RSI_REVERSION' | 'HYBRID';

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface MarketConditionInput {
  pair: string;
  currentPrice: number;
  rsi14: number;
  emaFast: number; // e.g. EMA 9
  emaSlow: number; // e.g. EMA 21
  bollingerUpper?: number;
  bollingerLower?: number;
  inPosition: boolean; // Apakah bot sedang memegang koin (true) atau IDR (false)
  buyPrice?: number;   // Harga beli jika sedang inPosition
}

export interface StrategySignalResult {
  strategyName: StrategyType;
  signal: SignalType;
  confidence: number; // 0.0 - 1.0
  reason: string;
  timestamp: string;
}
