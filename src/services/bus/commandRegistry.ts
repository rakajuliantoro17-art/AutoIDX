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
import type {
    BusHandlerDefinition,
} from "./busHandler";
export class CommandRegistry
    extends BusRegistry {
    public registerCommand
        TCommand = unknown,
        TResult = unknown,
    >(
        handler:
            CommandHandler<TCommand, TResult>,
    ): void {
        this.register(
            toCommandBusHandler(
                handler,
            ) as BusHandlerDefinition,
        );
    }
    public replaceCommand
        TCommand = unknown,
        TResult = unknown,
    >(
        handler:
            CommandHandler<TCommand, TResult>,
    ): void {
        this.replace(
            toCommandBusHandler(
                handler,
            ) as BusHandlerDefinition,
        );
    }
}
export default CommandRegistry;
