/**
==========================================================
AURA Trade OS
OpenAI Provider
Version : 0.1.0 Alpha
==========================================================
*/

export interface OpenAIResponse {

  success: boolean;

  provider: "openai";

  content: string | null;

  usage?: {

    inputTokens?: number;

    outputTokens?: number;

    totalTokens?: number;

  };

}

export interface OpenAIOptions {

  model?: string;

  temperature?: number;

  maxOutputTokens?: number;

}

const DEFAULT_MODEL =
  "gpt-5-mini";

export class OpenAIProvider {

  async query(

    prompt: string,

    options: OpenAIOptions = {}

  ): Promise<OpenAIResponse> {

    const apiKey =
      process.env.OPENAI_API_KEY;

    if (!apiKey) {

      console.warn(
        "[OpenAI] API Key not configured."
      );

      return {

        success: false,

        provider: "openai",

        content: null,

      };

    }

    try {

      const response =
        await fetch(

          "https://api.openai.com/v1/responses",

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

              input: [

                {

                  role: "system",

                  content: [

                    {

                      type: "input_text",

                      text:
`You are the AI Quantitative Market Analyst for AURA Trade OS.

Responsibilities:
- Validate trading signals.
- Evaluate market conditions.
- Assess risk.
- Explain reasoning objectively.

Rules:
- Never execute trades.
- Never claim certainty.
- Always prioritize risk management.`

                    }

                  ]

                },

                {

                  role: "user",

                  content: [

                    {

                      type: "input_text",

                      text: prompt

                    }

                  ]

                }

              ],

              temperature:

                options.temperature ??

                0.2,

              max_output_tokens:

                options.maxOutputTokens ??

                1200,

            })

          }

        );

      if (!response.ok) {

        throw new Error(

          `OpenAI API Error ${response.status}`

        );

      }

      const data =
        await response.json();

      return {

        success: true,

        provider: "openai",

        content:

          data.output_text ??

          null,

        usage: {

          inputTokens:

            data.usage?.input_tokens,

          outputTokens:

            data.usage?.output_tokens,

          totalTokens:

            data.usage?.total_tokens,

        }

      };

    }

    catch (error) {

      console.error(

        "[OpenAI Provider]",

        error

      );

      return {

        success: false,

        provider: "openai",

        content: null,

      };

    }

  }

}

const openAIProvider =
  new OpenAIProvider();

export default openAIProvider;
