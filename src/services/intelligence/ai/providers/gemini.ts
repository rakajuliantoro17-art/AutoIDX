/**
==========================================================
AURA Trade OS
Google Gemini AI Provider
Version : 0.1.0 Alpha
==========================================================
*/

export interface GeminiResponse {

  success: boolean;

  provider: "gemini";

  content: string | null;

  usage?: {

    promptTokens?: number;

    completionTokens?: number;

    totalTokens?: number;

  };

}

export interface GeminiOptions {

  model?: string;

  temperature?: number;

  maxTokens?: number;

}

const DEFAULT_MODEL =
  "gemini-2.5-flash";

export class GeminiProvider {

  async query(

    prompt: string,

    options: GeminiOptions = {}

  ): Promise<GeminiResponse> {

    const apiKey =
      process.env.GEMINI_API_KEY;

    if (!apiKey) {

      console.warn(
        "[Gemini] API Key not configured."
      );

      return {

        success: false,

        provider: "gemini",

        content: null,

      };

    }

    try {

      const response =
        await fetch(

          `https://generativelanguage.googleapis.com/v1beta/models/${
            options.model ??
            DEFAULT_MODEL
          }:generateContent?key=${apiKey}`,

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

            },

            body: JSON.stringify({

              systemInstruction: {

                parts: [

                  {

                    text:
`You are the AI quantitative market analyst for AURA Trade OS.

Never execute trades.

Only analyze market data, validate signals, evaluate risk, and explain your reasoning objectively.`

                  }

                ]

              },

              contents: [

                {

                  role: "user",

                  parts: [

                    {

                      text: prompt

                    }

                  ]

                }

              ],

              generationConfig: {

                temperature:

                  options.temperature ??

                  0.2,

                maxOutputTokens:

                  options.maxTokens ??

                  1200,

              }

            })

          }

        );

      if (!response.ok) {

        throw new Error(

          `Gemini API Error ${response.status}`

        );

      }

      const data =
        await response.json();

      return {

        success: true,

        provider: "gemini",

        content:

          data.candidates?.[0]

          ?.content

          ?.parts?.[0]

          ?.text

          ??

          null,

        usage: {

          promptTokens:

            data.usageMetadata

            ?.promptTokenCount,

          completionTokens:

            data.usageMetadata

            ?.candidatesTokenCount,

          totalTokens:

            data.usageMetadata

            ?.totalTokenCount,

        }

      };

    }

    catch (error) {

      console.error(

        "[Gemini Provider]",

        error

      );

      return {

        success: false,

        provider: "gemini",

        content: null,

      };

    }

  }

}

const geminiProvider =
  new GeminiProvider();

export default geminiProvider;
