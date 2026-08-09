/**
==========================================================
AURA Trade OS
Command Registry
Version : 0.0.7 Alpha
==========================================================
*/

import {
    BusRegistry,
} from "./busRegistry";

import type {
    CommandHandler,
} from "./commandHandler";

import {
    toCommandBusHandler,
} from "./commandHandler";

export class CommandRegistry
    extends BusRegistry {

    public registerCommand<
        TCommand = unknown,
        TResult = unknown,
    >(
        handler:
            CommandHandler<TCommand, TResult>,
    ): void {
        this.register(
            toCommandBusHandler(
                handler,
            ),
        );
    }

    public replaceCommand<
        TCommand = unknown,
        TResult = unknown,
    >(
        handler:
            CommandHandler<TCommand, TResult>,
    ): void {
        this.replace(
            toCommandBusHandler(
                handler,
            ),
        );
    }
}

export default CommandRegistry;
