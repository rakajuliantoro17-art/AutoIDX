/**
==========================================================
AURA Trade OS
Event Manager
Version : 0.0.7 Alpha
==========================================================
High-level Event Management
==========================================================
*/

import {
    AURAEvent,
} from "./event";

import {
    EventBus,
} from "./eventBus";

import {
    EventSerializer,
} from "./eventSerializer";

import {
    normalizeEvent,
} from "./eventNormalizer";

import type {
    EventOptions,
} from "./event";

import type {
    EventHandler,
} from "./eventHandler";

import type {
    EventType,
} from "./eventType";

import type {
    EventResult,
} from "./eventResult";


export class EventManager {

    public readonly bus:
        EventBus;

    public readonly serializer:
        EventSerializer;


    private started =
        false;


    public constructor(
        bus:
            EventBus =
            new EventBus(),
    ) {

        this.bus =
            bus;

        this.serializer =
            new EventSerializer();
    }


    public start(): void {
        this.started = true;
    }


    public stop(): void {
        this.started = false;
        this.bus.clearAll();
    }


    public isStarted(): boolean {
        return this.started;
    }


    public subscribe(
        type: EventType,
        handler: EventHandler,
        options: {
            readonly id?: string;
            readonly once?: boolean;
            readonly priority?: number;
        } = {},
    ): string {

        return this.bus.subscribe(
            type,
            handler,
            options,
        );
    }


    public unsubscribe(
        type: EventType,
        handlerId: string,
    ): boolean {

        return this.bus.unsubscribe(
            type,
            handlerId,
        );
    }


    public async emit<T = unknown>(
        options:
            EventOptions<T>,
    ):
        Promise<EventResult> {

        if (!this.started) {

            this.start();
        }


        const event =
            normalizeEvent(
                options,
            );


        return this.bus.publish(
            event,
        );
    }


    public async emitEvent<T = unknown>(
        event:
            AURAEvent<T>,
    ):
        Promise<EventResult> {

        if (!this.started) {

            this.start();
        }


        return this.bus.publish(
            event,
        );
    }


    public createEvent<T = unknown>(
        options:
            EventOptions<T>,
    ):
        AURAEvent<T> {

        return new AURAEvent(
            options,
        );
    }


    public serialize(
        event:
            AURAEvent,
    ): string {

        return this.serializer.serialize(
            event,
        );
    }


    public deserialize(
        serialized:
            string,
    ):
        AURAEvent {

        return this.serializer.deserialize(
            serialized,
        );
    }


    public pendingEvents(): number {
        return this.bus.pending();
    }


    public clear(): void {
        this.bus.clear();
    }
}


export const eventManager =
    new EventManager();


export default EventManager;
