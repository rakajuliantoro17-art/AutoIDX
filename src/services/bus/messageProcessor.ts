/**
==========================================================
AURA Trade OS
Message Processor
Version : 0.0.7 Alpha
==========================================================
*/

import {
    MessageQueue,
} from "./messageQueue";

import type {
    BusMessage,
} from "./busMessage";

import type {
    MessageRouter,
} from "./messageRouter";

export interface MessageProcessorOptions {
    readonly concurrency?: number;
}

export class MessageProcessor {
    private running =
        false;

    private processing =
        false;

    private readonly concurrency:
        number;

    public constructor(
        private readonly queue:
            MessageQueue,

        private readonly router:
            MessageRouter,

        options:
            MessageProcessorOptions = {},
    ) {
        this.concurrency =
            Math.max(
                1,
                options.concurrency ??
                    1,
            );
    }

    public start(): void {
        this.running = true;
    }

    public stop(): void {
        this.running = false;
    }

    public isRunning(): boolean {
        return this.running;
    }

    public enqueue(
        message:
            BusMessage,
    ): void {
        this.queue.enqueue(
            message,
        );
    }

    public async processOnce():
        Promise<unknown[]> {
        if (
            !this.running
        ) {
            this.start();
        }

        if (
            this.processing
        ) {
            return [];
        }

        this.processing = true;

        try {
            const messages =
                this.queue.drain();

            const results:
                unknown[] = [];

            for (
                let index = 0;
                index <
                messages.length;
                index +=
                    this.concurrency
            ) {
                const batch =
                    messages.slice(
                        index,
                        index +
                            this.concurrency,
                    );

                const batchResults =
                    await Promise.all(
                        batch.map(
                            message =>
                                this.router.route(
                                    message,
                                ),
                        ),
                    );

                results.push(
                    ...batchResults,
                );
            }

            return results;
        } finally {
            this.processing =
                false;
        }
    }
}

export default MessageProcessor;
