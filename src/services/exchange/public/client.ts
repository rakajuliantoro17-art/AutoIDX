/**
==========================================================
AURA Trade OS
Public Exchange HTTP Client
Version : 0.1.1 Alpha
==========================================================
*/

import {

    NetworkError,

} from "../errors/NetworkError";

import {

    RateLimitError,

} from "../errors/RateLimitError";

export interface PublicClientOptions {

    baseUrl: string;

    timeout?: number;

    headers?: HeadersInit;

}

export class PublicClient {

    readonly baseUrl: string;

    readonly timeout: number;

    readonly headers: HeadersInit;

    constructor(

        options: PublicClientOptions

    ) {

        this.baseUrl =

            options.baseUrl;

        this.timeout =

            options.timeout ?? 10000;

        this.headers =

            options.headers ?? {};

    }

    /**
     * Performs GET request.
     */
    async get<T>(

        path: string,

        params?: Record<string, string | number>

    ): Promise<T> {

        const url =

            new URL(

                path,

                this.baseUrl

            );

        if (params) {

            Object.entries(params)

                .forEach(

                    ([key, value]) =>

                        url.searchParams.set(

                            key,

                            String(value)

                        )

                );

        }

        const controller =

            new AbortController();

        const timer =

            setTimeout(

                () =>

                    controller.abort(),

                this.timeout

            );

        try {

            const response =

                await fetch(

                    url.toString(),

                    {

                        method: "GET",

                        headers: this.headers,

                        signal: controller.signal,

                    }

                );

            if (

                response.status === 429

            ) {

                throw new RateLimitError(

                    "Rate limit exceeded."

                );

            }

            if (

                !response.ok

            ) {

                throw new NetworkError(

                    `HTTP ${response.status}`

                );

            }

            return await response.json() as T;

        }

        finally {

            clearTimeout(timer);

        }

    }

}
