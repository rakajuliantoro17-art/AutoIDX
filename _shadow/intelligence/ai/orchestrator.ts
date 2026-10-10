/**
==========================================================
AURA Trade OS
AI Orchestrator
Version : 0.1.0 Alpha
==========================================================
*/

import aiCache from "./cache";

import aiConsensus, {
  AIConsensusInput,
} from "./consensus";

import openAIProvider
from "./providers/openai";

import geminiProvider
from "./providers/gemini";

import claudeProvider
from "./providers/claude";

import deepSeekProvider
from "./providers/deepseek";

import localAIProvider
from "./providers/local";

export interface AIOrchestratorOptions {

  providers?: Array<
    "openai"
    | "gemini"
    | "claude"
    | "deepseek"
    | "local"
  >;

  useCache?: boolean;

  useConsensus?: boolean;

}

export interface AIOrchestratorResult {

  success: boolean;

  content: string | null;

  provider: string;

}

export class AIOrchestrator {

  async execute(

    prompt: string,

    options: AIOrchestratorOptions = {}

  ): Promise<AIOrchestratorResult> {

    const providers =
      options.providers ??

      ["openai"];

    /**
     * Cache
     */

    if (
      options.useCache !== false &&
      providers.length === 1
    ) {

      const cached =
        aiCache.get<string>(
          prompt,
          providers[0]
        );

      if (cached) {

        return {

          success: true,

          provider:
            providers[0],

          content:
            cached,

        };

      }

    }

    const results:
      AIConsensusInput[] = [];

    for (

      const provider

      of providers

    ) {

      let response;

      switch (

        provider

      ) {

        case "openai":

          response =
            await openAIProvider.query(
              prompt
            );

          break;

        case "gemini":

          response =
            await geminiProvider.query(
              prompt
            );

          break;

        case "claude":

          response =
            await claudeProvider.query(
              prompt
            );

          break;

        case "deepseek":

          response =
            await deepSeekProvider.query(
              prompt
            );

          break;

        case "local":

          response =
            await localAIProvider.query(
              prompt
            );

          break;

      }

      if (
        response?.success &&
        response.content
      ) {

        aiCache.set(

          prompt,

          provider,

          response.content

        );

        /**
         * Phase 6
         *
         * sementara HOLD.
         *
         * nanti Analyzer
         * mengubah content
         * menjadi BUY/HOLD/SELL.
         */

        results.push({

          provider,

          signal: "HOLD",

          confidence: 80,

          weight: 20,

          explanation:
            response.content,

        });

      }

    }

    if (

      results.length === 0

    ) {

      return {

        success: false,

        provider: "none",

        content: null,

      };

    }

    if (

      options.useConsensus !== false &&

      results.length > 1

    ) {

      const consensus =

        aiConsensus.evaluate(

          results

        );

      return {

        success: true,

        provider: "consensus",

        content:
          consensus.explanation,

      };

    }

    return {

      success: true,

      provider:
        results[0].provider,

      content:
        results[0].explanation ??

        null,

    };

  }

}

const aiOrchestrator =
  new AIOrchestrator();

export default aiOrchestrator;
