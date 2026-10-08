/**
==========================================================
AURA Trade OS
Command Middleware
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    AURACommand,
} from "./command";

import type {
    CommandResult,
} from "./commandResult";


export type CommandMiddleware = (
    command: AURACommand,

    next: (
        command: AURACommand,
    ) =>
        CommandResult |
        Promise<CommandResult>,
) =>
    CommandResult |
    Promise<CommandResult>;


export class CommandMiddlewareChain {

    private readonly middleware:
        CommandMiddleware[] = [];


    public use(
        middleware: CommandMiddleware,
    ): this {

        this.middleware.push(
            middleware,
        );

        return this;
    }


    public async execute(
        command: AURACommand,

        terminal: (
            command: AURACommand,
        ) =>
            CommandResult |
            Promise<CommandResult>,
    ):
        Promise<CommandResult> {

        let index = -1;


        const dispatch =
            async (
                current:
                    AURACommand,
            ):
                Promise<CommandResult> => {

                index += 1;


                if (
                    index >=
                    this.middleware.length
                ) {
                    return terminal(
                        current,
                    );
                }


                const middleware =
                    this.middleware[index];


                return middleware(
                    current,
                    dispatch,
                );
            };


        return dispatch(
            command,
        );
    }


    public clear(): void {
        this.middleware.length = 0;
    }


    public size(): number {
        return this.middleware.length;
    }
}


export default CommandMiddlewareChain;
