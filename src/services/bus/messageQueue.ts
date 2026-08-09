/**
==========================================================
AURA Trade OS
Message Queue
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    BusMessage,
} from "./busMessage";

export class MessageQueue {
    private readonly queue:
        BusMessage[] = [];

    public enqueue(
        message:
            BusMessage,
    ): void {
        this.queue.push(
            message,
        );
    }

    public dequeue():
        BusMessage |
        undefined {
        return this.queue.shift();
    }

    public peek():
        BusMessage |
        undefined {
        return this.queue[0];
    }

    public size(): number {
        return this.queue.length;
    }

    public isEmpty(): boolean {
        return (
            this.queue.length === 0
        );
    }

    public clear(): void {
        this.queue.length = 0;
    }

    public drain():
        readonly BusMessage[] {
        const messages =
            this.queue.slice();

        this.clear();

        return messages;
    }
}

export default MessageQueue;
