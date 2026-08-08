/**
==========================================================
AURA Trade OS
Command Dispatcher
Version : 0.0.7 Alpha
==========================================================
*/

import type {
    AURACommand,
} from "./command";

import type {
    CommandRegistry,
} from "./commandRegistry";

import {
    createCommandResult,
    createFailedCommandResult,
} from "./commandResult";

import type {
    CommandResult,
} from "./commandResult";


export class CommandDispatcher {

    public constructor(
        private readonly registry:
            CommandRegistry,
    ) {}


    public async dispatch(
        command: AURACommand,
    ):
        Promise<CommandResult> {

        const started =
            Date.now();


        const handlers =
            this.registry.getHandlers(
                command.type,
            );


        if (
            handlers.length === 0
        ) {

            command.markRejected();


            return {
                ...createFailedCommandResult(
                    `No handler registered for command: ${command.type}`,
                ),

                commandId:
                    command.id,

                durationMs:
                    Date.now() -
                    started,
            };
        }


        command.markProcessing();


        try {

            let lastData:
                unknown;


            for (
                const registration
                of handlers
            ) {

                const result =
                    await registration.handler(
                        command,
                    );


                if (
                    !result.success
                ) {

                    command.markFailed();


                    return {
                        ...result,

                        commandId:
                            command.id,

                        durationMs:
                            Date.now() -
                            started,
                    };
                }


                lastData =
                    result.data;


                if (
                    registration.once
                ) {

                    this.registry.unregister(
                        command.type,
                        registration.id,
                    );
                }
            }


            command.markCompleted();


            return {
                ...createCommandResult(
                    lastData,
                ),

                commandId:
                    command.id,

                durationMs:
                    Date.now() -
                    started,

                timestamp:
                    Date.now(),
            };

        } catch (error) {

            command.markFailed();


            return {
                ...createFailedCommandResult(
                    error,
                ),

                commandId:
                    command.id,

                durationMs:
                    Date.now() -
                    started,
            };
        }
    }
}


export default CommandDispatcher;
