/**
==========================================================
AURA Trade OS
WebSocket Reconnect Manager
Version : 0.1.1 Alpha
==========================================================
*/

export interface ReconnectOptions {

    /**
     * Initial reconnect delay (ms)
     */
    initialDelay?: number;

    /**
     * Maximum reconnect delay (ms)
     */
    maxDelay?: number;

    /**
     * Backoff multiplier
     */
    multiplier?: number;

}

export class ReconnectManager {

    private attempts = 0;

    private readonly initialDelay: number;

    private readonly maxDelay: number;

    private readonly multiplier: number;

    constructor(

        options: ReconnectOptions = {}

    ) {

        this.initialDelay =

            options.initialDelay ?? 1000;

        this.maxDelay =

            options.maxDelay ?? 30000;

        this.multiplier =

            options.multiplier ?? 2;

    }

    /**
     * Reset reconnect state.
     */
    reset(): void {

        this.attempts = 0;

    }

    /**
     * Returns reconnect delay.
     */
    nextDelay(): number {

        const delay = Math.min(

            this.initialDelay *

            Math.pow(

                this.multiplier,

                this.attempts

            ),

            this.maxDelay

        );

        this.attempts++;

        return delay;

    }

    /**
     * Current reconnect attempt.
     */
    getAttempt(): number {

        return this.attempts;

    }

}
