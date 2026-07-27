/**
==========================================================
AURA Trade OS
DeepSeek AI Provider
Version : 0.1.0 Alpha
==========================================================
*/

export interface DeepSeekResponse {

  success: boolean;

  provider: "deepseek";

  content: string | null;

  usage?: {

    promptTokens?: number;

    completionTokens?: number;

    totalTokens?: number;

  };

}

export interface DeepSeekOptions {

  model?: string;

  temperature?: number;

  maxTokens?: number;

}

const DEFAULT_MODEL =
  "deepseek-chat";

export class DeepSeekProvider {

  async query(

    prompt: string,

    options: DeepSeekOptions = {}

  ): Promise<DeepSeekResponse> {

    const apiKey =
      process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {

      console.warn(

        "[DeepSeek] API Key not configured."

      );

      return {

        success: false,

        provider: "deepseek",

        content: null,

      };

    }

    try {

      const response =
        await fetch(

          "https://api.deepseek.com/chat/completions",

          {

            method: "POST",

            headers: {

              "Content-Type":

                "application/json",

              Authorization:

                `Bearer ${apiKey}`,

            },

            body: JSON.stringify({

              model:

                options.model ??

                DEFAULT_MODEL,

              temperature:

                options.temperature ??

                0.2,

              max_tokens:

                options.maxTokens ??

                1200,

              messages: [

                {

                  role: "system",

                  content:
`You are the AI quantitative market analyst for AURA Trade OS.

Never execute trades.

Only analyze, validate, explain risks and return objective conclusions.`

                },

                {

                  role: "user",

                  content: prompt,

                },

              ],

            }),

          }

        );

      if (!response.ok) {

        throw new Error(

          `DeepSeek API Error ${response.status}`

        );

      }

      const data =
        await response.json();

      return {

        success: true,

        provider: "deepseek",

        content:

          data.choices?.[0]

          ?.message

          ?.content

          ??

          null,

        usage: {

          promptTokens:

            data.usage?.prompt_tokens,

          completionTokens:

            data.usage?.completion_tokens,

          totalTokens:

            data.usage?.total_tokens,

        },

      };

    }

    catch (error) {

      console.error(

        "[DeepSeek Provider]",

        error

      );

      return {

        success: false,

        provider: "deepseek",

        content: null,

      };

    }

  }

}

const deepSeekProvider =
  new DeepSeekProvider();

export default deepSeekProvider;
