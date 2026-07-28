import { CoinGeckoClient } from './market/coingecko/client';
import { CoinGeckoCategoriesService } from './market/coingecko/categories';
import { ClaudeProvider } from './ai/providers/claude';
import { CapitaliseProvider } from './ai/providers/Capitalise';
import { HaasOnlineProvider } from './ai/providers/HaasOnline';
import { QuantConnectProvider } from './ai/providers/QuantConnect';

export type AIProviderType = 'claude' | 'capitalise' | 'haasOnline' | 'quantConnect';
export type MarketProviderType = 'coingeckoClient' | 'coingeckoCategories';

export interface ProviderRegistryConfig {
  aiConfigs?: {
    claude?: Record<string, unknown>;
    capitalise?: Record<string, unknown>;
    haasOnline?: Record<string, unknown>;
    quantConnect?: Record<string, unknown>;
  };
  marketConfigs?: {
    coingecko?: Record<string, unknown>;
  };
}

export class IntelligenceRegistry {
  private static instance: IntelligenceRegistry;

  private aiProviders: Map<string, unknown> = new Map();
  private marketProviders: Map<string, unknown> = new Map();

  private constructor() {
    // Private constructor untuk menerapkan Singleton Pattern
  }

  /**
   * Mengambil instance tunggal dari IntelligenceRegistry (Singleton)
   */
  public static getInstance(): IntelligenceRegistry {
    if (!IntelligenceRegistry.instance) {
      IntelligenceRegistry.instance = new IntelligenceRegistry();
    }
    return IntelligenceRegistry.instance;
  }

  /**
   * Menginisialisasi & mendaftarkan seluruh provider default berdasarkan konfigurasi
   */
  public initializeDefaults(config: ProviderRegistryConfig = {}): void {
    // 1. Register Market Providers
    const cgConfig = config.marketConfigs?.coingecko || {};
    const cgClient = new CoinGeckoClient(cgConfig);
    this.registerMarketProvider('coingeckoClient', cgClient);
    this.registerMarketProvider('coingeckoCategories', new CoinGeckoCategoriesService(cgConfig));

    // 2. Register AI Providers
    if (process.env.ANTHROPIC_API_KEY || config.aiConfigs?.claude) {
      this.registerAIProvider('claude', new ClaudeProvider(config.aiConfigs?.claude));
    }

    this.registerAIProvider('capitalise', new CapitaliseProvider(config.aiConfigs?.capitalise || {}));
    this.registerAIProvider('haasOnline', new HaasOnlineProvider(config.aiConfigs?.haasOnline || {}));
    this.registerAIProvider('quantConnect', new QuantConnectProvider(config.aiConfigs?.quantConnect || {}));
  }

  /**
   * Mendaftarkan atau mengganti AI Provider secara kustom/dinamis
   */
  public registerAIProvider<T>(name: AIProviderType | string, provider: T): void {
    this.aiProviders.set(name, provider);
  }

  /**
   * Mengambil instance AI Provider yang terdaftar
   */
  public getAIProvider<T>(name: AIProviderType | string): T {
    const provider = this.aiProviders.get(name);
    if (!provider) {
      throw new Error(`[IntelligenceRegistry] AI Provider '${name}' is not registered.`);
    }
    return provider as T;
  }

  /**
   * Mendaftarkan atau mengganti Market Data Provider secara dinamis
   */
  public registerMarketProvider<T>(name: MarketProviderType | string, provider: T): void {
    this.marketProviders.set(name, provider);
  }

  /**
   * Mengambil instance Market Data Provider yang terdaftar
   */
  public getMarketProvider<T>(name: MarketProviderType | string): T {
    const provider = this.marketProviders.get(name);
    if (!provider) {
      throw new Error(`[IntelligenceRegistry] Market Provider '${name}' is not registered.`);
    }
    return provider as T;
  }

  /**
   * Memeriksa apakah suatu provider sudah terdaftar
   */
  public hasProvider(name: string): boolean {
    return this.aiProviders.has(name) || this.marketProviders.has(name);
  }

  /**
   * Mengambil daftar seluruh nama AI & Market Providers yang terdaftar
   */
  public listRegisteredProviders(): { ai: string[]; market: string[] } {
    return {
      ai: Array.from(this.aiProviders.keys()),
      market: Array.from(this.marketProviders.keys()),
    };
  }
}

export default IntelligenceRegistry;
