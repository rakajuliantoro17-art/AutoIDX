/**
==========================================================
AURA Trade OS
Local AI Provider
Version : 0.1.0 Alpha
==========================================================
*/

export interface LocalAIResponse {

  success: boolean;

  provider: "local";

  content: string | null;

  latency?: number;

}

export interface LocalAIOptions {

  endpoint?: string;

  model?: string;

  temperature?: number;

}

const DEFAULT_ENDPOINT =
  "http://127.0.0.1:11434/api/generate";

const DEFAULT_MODEL =
  "qwen3:8b";

export class LocalAIProvider {

  async query(

    prompt: string,

    options: LocalAIOptions = {}

  ): Promise<LocalAIResponse> {

    const endpoint =

      options.endpoint ??

      DEFAULT_ENDPOINT;

    const started = Date.now();

    try {

      const response =

        await fetch(

          endpoint,

          {

            method: "POST",

            headers: {

              "Content-Type":

                "application/json",

            },

            body: JSON.stringify({

              model:

                options.model ??

                DEFAULT_MODEL,

              prompt,

              stream: false,

              options: {

                temperature:

                  options.temperature ??

                  0.2,

              },

            }),

          }

        );

      if (!response.ok) {

        throw new Error(

          `Local AI Error ${response.status}`

        );

      }

      const data =
        await response.json();

      return {

        success: true,

        provider: "local",

        content:

          data.response ??

          null,

        latency:

          Date.now() -

          started,

      };

    }

    catch (error) {

      console.error(

        "[Local AI]",

        error

      );

      return {

        success: false,

        provider: "local",

        content: null,

        latency:

          Date.now() -

          started,

      };

    }

  }

}

const localAI =
  new LocalAIProvider();

export default localAI;
