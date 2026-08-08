/**
==========================================================
AURA Trade OS
Command Registry
Version : 0.0.7 Alpha
==========================================================
*/

import {
    createCommandHandlerId,
} from "./commandHandler";

import type {
    CommandHandler,
    CommandHandlerRegistration,
} from "./commandHandler";

import type {
    CommandType,
} from "./commandType";


export class CommandRegistry {

    private readonly handlers:
        Map<
            CommandType,
            CommandHandlerRegistration[]
        > =
        new Map();


    public register(
        type: CommandType,

        handler: CommandHandler,

        options: {
            readonly id?: string;
            readonly once?: boolean;
            readonly priority?: number;
        } = {},
    ): string {

        const registration:
            CommandHandlerRegistration = {

            id:
                options.id ??
                createCommandHandlerId(),

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
        type: CommandType,
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
        type: CommandType,
    ):
        readonly CommandHandlerRegistration[] {

        return [
            ...(this.handlers.get(type) ?? []),
        ];
    }


    public has(
        type: CommandType,
    ): boolean {

        return (
            (
                this.handlers.get(type)
                    ?.length ??
                0
            ) > 0
        );
    }


    public clear(
        type?: CommandType,
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


export default CommandRegistry;
