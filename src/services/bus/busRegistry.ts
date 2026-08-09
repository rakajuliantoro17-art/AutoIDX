/**
==========================================================
AURA Trade OS
Bus Registry
Version : 0.0.7 Alpha
==========================================================
*/

import {
    BusError,
    BusErrorCode,
} from "./busError";

import type {
    BusHandlerDefinition,
} from "./busHandler";

export class BusRegistry {
    private readonly handlers:
        Map<
            string,
            BusHandlerDefinition
        > =
        new Map();

    public register(
        definition:
            BusHandlerDefinition,
    ): void {
        if (
            this.handlers.has(
                definition.messageName,
            )
        ) {
            throw new BusError(
                `Handler already registered for message: ${definition.messageName}`,
                {
                    code:
                        BusErrorCode.DUPLICATE_HANDLER,

                    handlerName:
                        definition.name,
                },
            );
        }

        this.handlers.set(
            definition.messageName,
            definition,
        );
    }

    public replace(
        definition:
            BusHandlerDefinition,
    ): void {
        this.handlers.set(
            definition.messageName,
            definition,
        );
    }

    public unregister(
        messageName: string,
    ): boolean {
        return this.handlers.delete(
            messageName,
        );
    }

    public get(
        messageName: string,
    ):
        BusHandlerDefinition |
        undefined {
        return this.handlers.get(
            messageName,
        );
    }

    public has(
        messageName: string,
    ): boolean {
        return this.handlers.has(
            messageName,
        );
    }

    public list():
        readonly BusHandlerDefinition[] {
        return [
            ...this.handlers.values(),
        ];
    }

    public clear(): void {
        this.handlers.clear();
    }

    public size(): number {
        return this.handlers.size;
    }
}

export default BusRegistry;
