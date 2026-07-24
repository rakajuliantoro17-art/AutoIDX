import { queryAIModel } from './client';
import { MARKET_ANALYSIS_PROMPT } from './promptTemplates';

export interface AIAnalysisResult {
  decision: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reason: string;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
}

export interface MarketMetrics {
  pair: string;
  price: number;
  rsi: number;
  emaFast: number;
  emaSlow: number;
}

/**
 * Menganalisis kondisi pasar menggunakan model AI berbasis metrics Indodax
 */
export async function analyzeMarketWithAI(metrics: MarketMetrics): Promise<AIAnalysisResult> {
  const trendCondition = metrics.emaFast > metrics.emaSlow ? 'Bullish Crossover' : 'Bearish Crossover';

  // Susun prompt berdasarkan template
  const filledPrompt = MARKET_ANALYSIS_PROMPT
    .replace('{{pair}}', metrics.pair.toUpperCase())
    .replace('{{price}}', metrics.price.toLocaleString('id-ID'))
    .replace('{{rsi}}', metrics.rsi.toString())
    .replace('{{emaFast}}', metrics.emaFast.toString())
    .replace('{{emaSlow}}', metrics.emaSlow.toString())
    .replace('{{trendCondition}}', trendCondition);

  const rawAiResponse = await queryAIModel(filledPrompt);

  // Fallback default jika API AI gagal atau key tidak diset
  if (!rawAiResponse) {
    return {
      decision: metrics.rsi < 30 ? 'BUY' : metrics.rsi > 70 ? 'SELL' : 'HOLD',
      confidence: 0.5,
      reason: 'Fallback ke aturan statistik dasar (AI Service unavailable).',
      suggestedStopLoss: 2.0,
      suggestedTakeProfit: 4.0,
    };
  }

  try {
    // Parse JSON dari response AI
    const cleanedResponse = rawAiResponse.replace(/```json|```/g, '').trim();
    const parsedData: AIAnalysisResult = JSON.parse(cleanedResponse);
    return parsedData;
  } catch (error) {
    console.error('[AI Sentiment Parse Error]:', error);
    return {
      decision: 'HOLD',
      confidence: 0.0,
      reason: 'Gagal memproses parsing JSON dari respons AI.',
      suggestedStopLoss: 2.0,
      suggestedTakeProfit: 4.0,
    };
  }
}