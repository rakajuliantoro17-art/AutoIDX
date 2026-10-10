/**
==========================================================
AURA Trade OS
AI Client Service
Version : 0.1.0 Alpha
==========================================================
*/

export type AIProvider =
  | "AUTO"
  | "OPENAI"
  | "GEMINI";

export interface AIResponse {

  success: boolean;

  provider: string;

  model: string;

  content: string | null;

  latencyMs: number;

  error?: string;

}

const DEFAULT_TIMEOUT = 30000;

export async function queryAIModel(

  prompt: string,

  provider: AIProvider = "AUTO"

): Promise<AIResponse> {

  const started = Date.now();

  const openAIKey =
    process.env.OPENAI_API_KEY;

  const geminiKey =
    process.env.GEMINI_API_KEY;

  try {

    /**
     * AUTO Provider
     */

    if (provider === "AUTO") {

      if (openAIKey) {

        const result =
          await queryOpenAI(
            prompt,
            openAIKey
          );

        if (result.success) {

          result.latencyMs =
            Date.now() - started;

          return result;

        }

      }

      if (geminiKey) {

        const result =
          await queryGemini(
            prompt,
            geminiKey
          );

        result.latencyMs =
          Date.now() - started;

        return result;

      }

      return {

        success: false,

        provider: "NONE",

        model: "-",

        content: null,

        latencyMs:
          Date.now() - started,

        error:
          "No AI provider configured.",

      };

    }

    /**
     * OpenAI Only
     */

    if (provider === "OPENAI") {

      if (!openAIKey) {

        throw new Error(
          "OPENAI_API_KEY missing."
        );

      }

      const result =
        await queryOpenAI(
          prompt,
          openAIKey
        );

      result.latencyMs =
        Date.now() - started;

      return result;

    }

    /**
     * Gemini Only
     */

    if (provider === "GEMINI") {

      if (!geminiKey) {

        throw new Error(
          "GEMINI_API_KEY missing."
        );

      }

      const result =
        await queryGemini(
          prompt,
          geminiKey
        );

      result.latencyMs =
        Date.now() - started;

      return result;

    }

    throw new Error(
      "Unsupported provider."
    );

  } catch (error) {

    return {

      success: false,

      provider,

      model: "-",

      content: null,

      latencyMs:
        Date.now() - started,

      error:
        error instanceof Error
          ? error.message
          : "Unknown AI error",

    };

  }

}

/* =======================================================
 * OpenAI
 * ======================================================= */

async function queryOpenAI(

  prompt: string,

  apiKey: string

): Promise<AIResponse> {

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      DEFAULT_TIMEOUT
    );

  try {

    const response =
      await fetch(
        "https://api.openai.com/v1/chat/completions",
        {

          method: "POST",

          signal:
            controller.signal,

          headers: {

            Authorization:
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify({

            model: "gpt-4.1-mini",

            temperature: 0.2,

            messages: [

              {

                role: "system",

                content:
                  "You are a professional quantitative crypto analyst. Never execute trades. Only provide market analysis.",

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
        `OpenAI HTTP ${response.status}`
      );

    }

    const data =
      await response.json();

    return {

      success: true,

      provider: "OPENAI",

      model:
        data.model ??
        "gpt-4.1-mini",

      latencyMs: 0,

      content:
        data.choices?.[0]
          ?.message?.content ??
        null,

    };

  } finally {

    clearTimeout(timeout);

  }

}

/* =======================================================
 * Gemini
 * ======================================================= */

async function queryGemini(

  prompt: string,

  apiKey: string

): Promise<AIResponse> {

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () =>
        controller.abort(),
      DEFAULT_TIMEOUT
    );

  try {

    const response =
      await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {

          method: "POST",

          signal:
            controller.signal,

          headers: {

            "Content-Type":
              "application/json",

          },

          body: JSON.stringify({

            contents: [

              {

                parts: [

                  {

                    text: prompt,

                  },

                ],

              },

            ],

          }),

        }

      );

    if (!response.ok) {

      throw new Error(
        `Gemini HTTP ${response.status}`
      );

    }

    const data =
      await response.json();

    return {

      success: true,

      provider: "GEMINI",

      model:
        "gemini-2.5-flash",

      latencyMs: 0,

      content:
        data.candidates?.[0]
          ?.content?.parts?.[0]
          ?.text ?? null,

    };

  } finally {

    clearTimeout(timeout);

  }

}

export default queryAIModel;
