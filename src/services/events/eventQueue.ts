/**
==========================================================
AURA Trade OS
Event Queue
Version : 0.0.7 Alpha
==========================================================
*/
import {
    EventPriority,
} from "./eventPriority";
import type {
    AURAEvent,
} from "./event";
export class EventQueue {
    private readonly items:
        AURAEvent[] = [];
    public enqueue(
        event: AURAEvent,
    ): void {
        event.markQueued();
        this.items.push(event);
        this.sort();
    }
    public dequeue():
        AURAEvent | undefined {
        return this.items.shift();
    }
    public peek():
        AURAEvent | undefined {
        return this.items[0];
    }
    public remove(
        eventId: string,
    ): boolean {
        const index =
            this.items.findIndex(
                event =>
                    event.id === eventId,
            );
        if (index < 0) {
            return false;
        }
        this.items.splice(
            index,
            1,
        );
        return true;
    }
    public clear(): void {
        this.items.length = 0;
    }
    public size(): number {
        return this.items.length;
    }
    public isEmpty(): boolean {
        return this.items.length === 0;
    }
    public values():
        readonly AURAEvent[] {
        return [
            ...this.items,
        ];
    }
    private sort(): void {
        this.items.sort(
            (
                left,
                right,
            ) => {
                if (
                    left.priority !==
                    right.priority
                ) {
                    return (
                        right.priority -
                        left.priority
                    );
                }
                return (
                    left.timestamp -
                    right.timestamp
                );
            },
        );
    }
}
export default EventQueue;
