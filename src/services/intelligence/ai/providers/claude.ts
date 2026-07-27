/**
==========================================================
AURA Trade OS
Claude AI Provider
Version : 0.1.0 Alpha
==========================================================
*/

export interface ClaudeResponse {

  success: boolean;

  provider: "claude";

  content: string | null;

  usage?: {

    inputTokens?: number;

    outputTokens?: number;

  };

}

export interface ClaudeOptions {

  model?: string;

  temperature?: number;

  maxTokens?: number;

}

const DEFAULT_MODEL =
  "claude-3-5-sonnet-latest";

export class ClaudeProvider {

  async query(

    prompt: string,

    options: ClaudeOptions = {}

  ): Promise<ClaudeResponse> {

    const apiKey =
      process.env.CLAUDE_API_KEY;

    if (!apiKey) {

      console.warn(
        "[Claude] API Key not configured."
      );

      return {

        success: false,

        provider: "claude",

        content: null,

      };

    }

    try {

      const response =
        await fetch(

          "https://api.anthropic.com/v1/messages",

          {

            method: "POST",

            headers: {

              "Content-Type":
                "application/json",

              "x-api-key":
                apiKey,

              "anthropic-version":
                "2023-06-01",

            },

            body: JSON.stringify({

              model:

                options.model ??

                DEFAULT_MODEL,

              max_tokens:

                options.maxTokens ??

                1200,

              temperature:

                options.temperature ??

                0.2,

              system:
                `You are the AI market analyst for AURA Trade OS.
Never execute trades.
Only validate, analyze, and explain trading decisions.`,

              messages: [

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

          `Claude API Error ${response.status}`

        );

      }

      const data =
        await response.json();

      return {

        success: true,

        provider: "claude",

        content:

          data.content?.[0]?.text ??

          null,

        usage: {

          inputTokens:

            data.usage?.input_tokens,

          outputTokens:

            data.usage?.output_tokens,

        },

      };

    }

    catch (error) {

      console.error(

        "[Claude Provider]",

        error

      );

      return {

        success: false,

        provider: "claude",

        content: null,

      };

    }

  }

}

const claudeProvider =
  new ClaudeProvider();

export default claudeProvider;
