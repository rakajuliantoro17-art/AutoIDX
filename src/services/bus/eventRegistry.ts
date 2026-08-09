/**
==========================================================
AURA Trade OS
Event Registry
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    EventHandler,
} from "./eventHandler";

export class EventRegistry {
    private readonly handlers:
        Map<
            string,
            EventHandler[]
        > =
        new Map();

    public register<
        TEvent = unknown,
        TResult = unknown,
    >(
        handler:
            EventHandler<TEvent, TResult>,
    ): void {
        const existing =
            this.handlers.get(
                handler.eventName,
            );

        if (existing) {
            existing.push(
                handler as EventHandler,
            );

            return;
        }

        this.handlers.set(
            handler.eventName,
            [
                handler as EventHandler,
            ],
        );
    }

    public unregister(
        eventName: string,
        handlerName?: string,
    ): boolean {
        const handlers =
            this.handlers.get(
                eventName,
            );

        if (!handlers) {
            return false;
        }

        if (!handlerName) {
            return this.handlers.delete(
                eventName,
            );
        }

        const index =
            handlers.findIndex(
                handler =>
                    handler.name ===
                    handlerName,
            );

        if (index < 0) {
            return false;
        }

        handlers.splice(
            index,
            1,
        );

        if (
            handlers.length === 0
        ) {
            this.handlers.delete(
                eventName,
            );
        }

        return true;
    }

    public get(
        eventName: string,
    ):
        readonly EventHandler[] {
        return [
            ...(
                this.handlers.get(
                    eventName,
                ) ?? []
            ),
        ];
    }

    public has(
        eventName: string,
    ): boolean {
        return (
            this.handlers.has(
                eventName,
            ) &&
            (
                this.handlers.get(
                    eventName,
                )?.length ?? 0
            ) > 0
        );
    }

    public clear(): void {
        this.handlers.clear();
    }

    public size(): number {
        let total = 0;

        for (
            const handlers
            of this.handlers.values()
        ) {
            total +=
                handlers.length;
        }

        return total;
    }
}

export default EventRegistry;
