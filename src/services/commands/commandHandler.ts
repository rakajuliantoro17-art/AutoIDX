/**
==========================================================
AURA Trade OS
Command Handler
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    AURACommand,
} from "./command";

import type {
    CommandResult,
} from "./commandResult";


export type CommandHandler<
    T = unknown,
> = (
    command: AURACommand<T>,
) =>
    CommandResult |
    Promise<CommandResult>;


export interface CommandHandlerRegistration {
    readonly id: string;

    readonly handler:
        CommandHandler;

    readonly once?:
        boolean;

    readonly priority?:
        number;
}


export function createCommandHandlerId(): string {

    return [
        "handler",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 8),
    ].join("-");
}
