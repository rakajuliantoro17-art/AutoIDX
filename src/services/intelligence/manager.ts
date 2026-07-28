import CoinGeckoClient from './market/coingecko/client';
import CoinGeckoCategoriesService from './market/coingecko/categories';
import ClaudeProvider, { TradingAnalysisRequest, TradingAnalysisResponse } from './ai/providers/claude';
import CapitaliseProvider from './ai/providers/Capitalise';
import HaasOnlineProvider from './ai/providers/HaasOnline';
import QuantConnectProvider from './ai/providers/QuantConnect';

export interface IntelligenceManagerConfig {
  coinGeckoApiKey?: string;
  coinGeckoIsPro?: boolean;
  anthropicApiKey?: string;
  capitaliseWebhookUrl?: string;
  haasBaseUrl?: string;
  haasSecretKey?: string;
  quantConnectUserId?: string;
  quantConnectApiToken?: string;
  quantConnectProjectId?: number;
}

export interface MarketAnalysisWorkflowInput {
  symbol: string;
  categoryId?: string;
  timeframe?: string;
  customPrompt?: string;
}

export interface ExecutionTargets {
  capitalise?: boolean;
  haasOnline?: { botId: string };
  quantConnect?: boolean;
}

export class IntelligenceManager {
  // Market Services
  public coinGeckoClient: CoinGeckoClient;
  public coinGeckoCategories: CoinGeckoCategoriesService;

  // AI & Execution Providers
  public claude: ClaudeProvider;
  public capitalise: CapitaliseProvider;
  public haasOnline: HaasOnlineProvider;
  public quantConnect: QuantConnectProvider;

  constructor(config: IntelligenceManagerConfig = {}) {
    // Inisialisasi Market Data Services
    this.coinGeckoClient = new CoinGeckoClient({
      apiKey: config.coinGeckoApiKey,
      isPro: config.coinGeckoIsPro,
    });

    this.coinGeckoCategories = new CoinGeckoCategoriesService({
      apiKey: config.coinGeckoApiKey,
      isPro: config.coinGeckoIsPro,
    });

    // Inisialisasi AI Providers
    this.claude = new ClaudeProvider({
      apiKey: config.anthropicApiKey,
    });

    this.capitalise = new CapitaliseProvider({
      webhookUrl: config.capitaliseWebhookUrl,
    });

    this.haasOnline = new HaasOnlineProvider({
      baseUrl: config.haasBaseUrl,
      secretKey: config.haasSecretKey,
    });

    this.quantConnect = new QuantConnectProvider({
      userId: config.quantConnectUserId,
      apiToken: config.quantConnectApiToken,
      projectId: config.quantConnectProjectId,
    });
  }

  /**
   * Check ketersediaan & konektivitas semua service
   */
  public async checkHealth(): Promise<Record<string, boolean>> {
    const cgPing = await this.coinGeckoClient.ping();
    
    return {
      coinGecko: cgPing,
      claude: Boolean(process.env.ANTHROPIC_API_KEY || this.claude),
      capitalise: Boolean(this.capitalise),
      haasOnline: Boolean(this.haasOnline),
      quantConnect: Boolean(this.quantConnect),
    };
  }

  /**
   * E2E Workflow: Membaca Trend Pasar Kategori -> Melakukan Analisis AI (Claude) -> Menghasilkan Sinyal
   */
  public async runMarketAnalysis(input: MarketAnalysisWorkflowInput): Promise<TradingAnalysisResponse> {
    const timeframe = input.timeframe || '1h';
    let marketContext: Record<string, unknown> = {};

    // Jika categoryId diberikan, ambil context koin-koin di kategori tersebut
    if (input.categoryId) {
      try {
        const categoryCoins = await this.coinGeckoCategories.getCoinsByCategory(input.categoryId, 5);
        marketContext.categoryTopCoins = categoryCoins;
      } catch (err) {
        console.warn(`[IntelligenceManager] Failed to fetch category context for ${input.categoryId}`);
      }
    }

    const requestPayload: TradingAnalysisRequest = {
      symbol: input.symbol,
      timeframe,
      marketData: marketContext,
      customPrompt: input.customPrompt,
    };

    // Minta Claude menganalisis data pasar
    return await this.claude.analyzeMarket(requestPayload);
  }

  /**
   * Mengirimkan Sinyal Hasil Analisis AI ke Berbagai Platform Trading Eksekusi
   */
  public async dispatchSignal(
    analysis: TradingAnalysisResponse,
    targets: ExecutionTargets
  ): Promise<Record<string, unknown>> {
    const results: Record<string, unknown> = {};

    // 1. Dispatch ke Capitalise.ai jika diaktifkan
    if (targets.capitalise) {
      results.capitalise = await this.capitalise.sendSignal({
        symbol: analysis.symbol,
        action: analysis.action === 'HOLD' ? 'BUY' : analysis.action, // mapping default
        confidenceScore: analysis.confidenceScore,
        reasoning: analysis.reasoning,
        stopLoss: analysis.stopLoss,
        takeProfit: analysis.takeProfit,
      });
    }

    // 2. Dispatch ke HaasOnline jika botId dikirim
    if (targets.haasOnline?.botId) {
      results.haasOnline = await this.haasOnline.sendSignal({
        botId: targets.haasOnline.botId,
        symbol: analysis.symbol,
        action: analysis.action,
        signalConfidence: analysis.confidenceScore,
        note: analysis.reasoning,
      });
    }

    // 3. Sync ke QuantConnect Lean Engine jika diaktifkan
    if (targets.quantConnect) {
      results.quantConnect = await this.quantConnect.sendSignal({
        symbol: analysis.symbol,
        action: analysis.action,
        confidenceScore: analysis.confidenceScore,
        reasoning: analysis.reasoning,
      });
    }

    return results;
  }
}

export default IntelligenceManager;
