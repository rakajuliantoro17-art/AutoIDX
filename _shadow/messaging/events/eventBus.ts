/**
==========================================================
AURA Trade OS
Event Bus
Version : 0.2.0 Alpha
==========================================================
Central Event Bus
==========================================================
*/

import { logger } from "@/services/logger";

import type { AURAEvent } from "./event";

import type {
    EventHandler as SubscriberHandler,
    EventHandlerRegistration,
} from "./eventHandler";

import { createEventHandlerId } from "./eventHandler";

import type { EventResult } from "./eventResult";

/*
==========================================================
Types (Legacy simple pub-sub API)
==========================================================
*/

export type EventHandler<T = unknown> = (

    payload: T,

) => void | Promise<void>;

export interface EventSubscription {

    event: string;

    handler: EventHandler;

}

/*
==========================================================
Event Bus
==========================================================
*/

export class EventBus {

    private readonly listeners =
        new Map<string, Set<EventHandler>>();

    private readonly registrations =
        new Map<string, EventHandlerRegistration[]>();

    private pendingCount = 0;

    public on<T>(
        event: string,
        handler: EventHandler<T>,
    ): void {

        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }

        this.listeners.get(event)!.add(handler as EventHandler);

        logger.debug(`Subscribed to "${event}".`);

    }

    public once<T>(
        event: string,
        handler: EventHandler<T>,
    ): void {

        const wrapper: EventHandler = async (payload) => {
            this.off(event, wrapper);
            await handler(payload as T);
        };

        this.on(event, wrapper);

    }

    public off(
        event: string,
        handler: EventHandler,
    ): void {

        const handlers = this.listeners.get(event);

        if (!handlers) {
            return;
        }

        handlers.delete(handler);

        if (handlers.size === 0) {
            this.listeners.delete(event);
        }

        logger.debug(`Unsubscribed from "${event}".`);

    }

    public async emit<T>(
        event: string,
        payload?: T,
    ): Promise<void> {

        const handlers = this.listeners.get(event);

        if (!handlers) {
            return;
        }

        logger.debug(`Emitting "${event}".`);

        for (const handler of handlers) {

            try {
                await handler(payload);
            }
            catch (error) {
                logger.error(`Event "${event}" failed.`, error);
            }

        }

    }

    public subscribe(
        type: string,
        handler: SubscriberHandler,
        options: {
            readonly id?: string;
            readonly once?: boolean;
            readonly priority?: number;
        } = {},
    ): string {

        const id = options.id ?? createEventHandlerId();

        const registration: EventHandlerRegistration = {
            id,
            handler,
            once: options.once,
            priority: options.priority ?? 0,
        };

        const existing = this.registrations.get(type) ?? [];

        existing.push(registration);

        existing.sort(
            (a, b) => (b.priority ?? 0) - (a.priority ?? 0),
        );

        this.registrations.set(type, existing);

        logger.debug(`Subscribed handler "${id}" to "${type}".`);

        return id;

    }

    public unsubscribe(
        type: string,
        handlerId: string,
    ): boolean {

        const existing = this.registrations.get(type);

        if (!existing) {
            return false;
        }

        const next = existing.filter(
            (registration) => registration.id !== handlerId,
        );

        const removed = next.length !== existing.length;

        if (next.length === 0) {
            this.registrations.delete(type);
        }
        else {
            this.registrations.set(type, next);
        }

        return removed;

    }

    public async publish<T = unknown>(
        event: AURAEvent<T>,
    ): Promise<EventResult> {

        const start = Date.now();

        this.pendingCount++;

        try {

            const registrations = this.registrations.get(event.type) ?? [];

            for (const registration of [...registrations]) {

                try {
                    await registration.handler(event);
                }
                catch (error) {
                    logger.error(
                        `Event "${event.type}" handler "${registration.id}" failed.`,
                        error,
                    );
                }

                if (registration.once) {
                    this.unsubscribe(event.type, registration.id);
                }

            }

            return {
                success: true,
                eventId: event.id,
                timestamp: Date.now(),
                durationMs: Date.now() - start,
            };

        }
        finally {
            this.pendingCount--;
        }

    }

    public pending(): number {
        return this.pendingCount;
    }

    public clear(
        event?: string,
    ): void {

        if (event) {
            this.listeners.delete(event);
            this.registrations.delete(event);
            return;
        }

        this.clearAll();

    }

    public clearAll(): void {
        this.listeners.clear();
        this.registrations.clear();
    }

    public listenerCount(
        event: string,
    ): number {
        return this.listeners.get(event)?.size ?? 0;
    }

    public events(): string[] {
        return [...this.listeners.keys()].sort();
    }

}

/*
==========================================================
Singleton
==========================================================
*/

export const eventBus =
    new EventBus();
