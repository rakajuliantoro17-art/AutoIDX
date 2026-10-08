/**
==========================================================
AURA Trade OS
Event Registry
Version : 0.0.7 Alpha
==========================================================
*/

import {
    createEventHandlerId,
} from "./eventHandler";

import type {
    EventHandler,
    EventHandlerRegistration,
} from "./eventHandler";

import type {
    EventType,
} from "./eventType";


export class EventRegistry {

    private readonly handlers:
        Map<
            EventType,
            EventHandlerRegistration[]
        > = new Map();


    public register(
        type: EventType,
        handler: EventHandler,
        options: {
            readonly id?: string;
            readonly once?: boolean;
            readonly priority?: number;
        } = {},
    ): string {

        const registration:
            EventHandlerRegistration = {

            id:
                options.id ??
                createEventHandlerId(),

            handler,

            once:
                options.once,

            priority:
                options.priority ??
                0,
        };


        const current =
            this.handlers.get(type) ??
            [];


        current.push(
            registration,
        );


        current.sort(
            (
                left,
                right,
            ) =>
                (right.priority ?? 0) -
                (left.priority ?? 0),
        );


        this.handlers.set(
            type,
            current,
        );


        return registration.id;
    }


    public unregister(
        type: EventType,
        handlerId: string,
    ): boolean {

        const current =
            this.handlers.get(type);

        if (!current) {
            return false;
        }


        const index =
            current.findIndex(
                handler =>
                    handler.id === handlerId,
            );


        if (index < 0) {
            return false;
        }


        current.splice(
            index,
            1,
        );


        if (current.length === 0) {
            this.handlers.delete(type);
        }


        return true;
    }


    public getHandlers(
        type: EventType,
    ):
        readonly EventHandlerRegistration[] {

        return [
            ...(this.handlers.get(type) ?? []),
        ];
    }


    public has(
        type: EventType,
    ): boolean {

        return (
            this.handlers.has(type) &&
            (
                this.handlers.get(type)
                    ?.length ??
                0
            ) > 0
        );
    }


    public clear(
        type?: EventType,
    ): void {

        if (type) {
            this.handlers.delete(type);
            return;
        }

        this.handlers.clear();
    }


    public size(): number {

        let count = 0;

        for (
            const handlers
            of this.handlers.values()
        ) {
            count += handlers.length;
        }

        return count;
    }
}


export default EventRegistry;
