/**
==========================================================
AURA Trade OS
AI Router
Version : 0.1.0 Alpha
==========================================================
*/

export type AIProviderName =

  | "openai"
  | "gemini"
  | "claude"
  | "deepseek"
  | "local";

export type AITask =

  | "TECHNICAL_ANALYSIS"
  | "MARKET_SUMMARY"
  | "RISK_ANALYSIS"
  | "STRATEGY_REVIEW"
  | "DOCUMENT_ANALYSIS"
  | "RESEARCH"
  | "GENERAL";

export interface ProviderCapability {

  provider: AIProviderName;

  priority: number;

  enabled: boolean;

  available: boolean;

  cost: number;

  supports: AITask[];

}

export interface RouteRequest {

  task: AITask;

  allowFallback?: boolean;

}

export class AIRouter {

  private providers:
    ProviderCapability[] = [

    {

      provider: "openai",

      priority: 100,

      enabled: true,

      available: true,

      cost: 5,

      supports: [

        "GENERAL",

        "RISK_ANALYSIS",

        "STRATEGY_REVIEW",

        "DOCUMENT_ANALYSIS"

      ]

    },

    {

      provider: "gemini",

      priority: 90,

      enabled: true,

      available: true,

      cost: 3,

      supports: [

        "GENERAL",

        "MARKET_SUMMARY",

        "DOCUMENT_ANALYSIS"

      ]

    },

    {

      provider: "claude",

      priority: 95,

      enabled: true,

      available: true,

      cost: 4,

      supports: [

        "GENERAL",

        "STRATEGY_REVIEW",

        "DOCUMENT_ANALYSIS"

      ]

    },

    {

      provider: "deepseek",

      priority: 85,

      enabled: true,

      available: true,

      cost: 2,

      supports: [

        "GENERAL",

        "TECHNICAL_ANALYSIS"

      ]

    },

    {

      provider: "local",

      priority: 50,

      enabled: true,

      available: true,

      cost: 0,

      supports: [

        "GENERAL",

        "TECHNICAL_ANALYSIS",

        "MARKET_SUMMARY",

        "RISK_ANALYSIS"

      ]

    }

  ];

  /**
   * Resolve Best Provider
   */

  resolve(

    request: RouteRequest

  ): AIProviderName[] {

    const candidates =

      this.providers

        .filter(

          provider =>

            provider.enabled &&

            provider.available &&

            provider.supports.includes(

              request.task

            )

        )

        .sort(

          (a, b) =>

            b.priority -

            a.priority

        );

    if (

      candidates.length === 0

    ) {

      return ["local"];

    }

    if (

      request.allowFallback === false

    ) {

      return [

        candidates[0].provider

      ];

    }

    return candidates.map(

      provider =>

        provider.provider

    );

  }

  /**
   * Enable Provider
   */

  enable(

    provider: AIProviderName

  ) {

    const item =

      this.providers.find(

        p =>

          p.provider === provider

      );

    if (item) {

      item.enabled = true;

    }

  }

  /**
   * Disable Provider
   */

  disable(

    provider: AIProviderName

  ) {

    const item =

      this.providers.find(

        p =>

          p.provider === provider

      );

    if (item) {

      item.enabled = false;

    }

  }

  /**
   * Mark Availability
   */

  setAvailability(

    provider: AIProviderName,

    available: boolean

  ) {

    const item =

      this.providers.find(

        p =>

          p.provider === provider

      );

    if (item) {

      item.available = available;

    }

  }

  /**
   * Provider List
   */

  getProviders() {

    return [...this.providers];

  }

}

const aiRouter =
  new AIRouter();

export default aiRouter;
