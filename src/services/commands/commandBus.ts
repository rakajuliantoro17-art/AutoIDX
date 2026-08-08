/**
==========================================================
AURA Trade OS
Command Bus
Version : 0.0.7 Alpha
==========================================================
*/

import {
    AURACommand,
} from "./command";

import {
    CommandDispatcher,
} from "./commandDispatcher";

import {
    CommandMiddlewareChain,
} from "./commandMiddleware";

import {
    CommandRegistry,
} from "./commandRegistry";

import {
    CommandQueue,
} from "./commandQueue";

import {
    createCommandResult,
} from "./commandResult";

import type {
    CommandHandler,
} from "./commandHandler";

import type {
    CommandType,
} from "./commandType";

import type {
    CommandResult,
} from "./commandResult";


export class CommandBus {

    public readonly registry:
        CommandRegistry;

    public readonly queue:
        CommandQueue;

    public readonly middleware:
        CommandMiddlewareChain;

    public readonly dispatcher:
        CommandDispatcher;


    private processing =
        false;


    public constructor() {

        this.registry =
            new CommandRegistry();

        this.queue =
            new CommandQueue();

        this.middleware =
            new CommandMiddlewareChain();

        this.dispatcher =
            new CommandDispatcher(
                this.registry,
            );
    }


    public register(
        type: CommandType,
        handler: CommandHandler,
        options: {
            readonly id?: string;
            readonly once?: boolean;
            readonly priority?: number;
        } = {},
    ): string {

        return this.registry.register(
            type,
            handler,
            options,
        );
    }


    public unregister(
        type: CommandType,
        handlerId: string,
    ): boolean {

        return this.registry.unregister(
            type,
            handlerId,
        );
    }


    public async execute<
        T = unknown,
    >(
        command:
            AURACommand<T>,
    ):
        Promise<CommandResult> {

        this.queue.enqueue(
            command,
        );

        return this.process();
    }


    public async executeMany(
        commands:
            readonly AURACommand[],
    ):
        Promise<
            readonly CommandResult[]
        > {

        for (
            const command
            of commands
        ) {
            this.queue.enqueue(
                command,
            );
        }


        const results:
            CommandResult[] = [];


        while (
            !this.queue.isEmpty()
        ) {

            results.push(
                await this.process(),
            );
        }


        return results;
    }


    public async process():
        Promise<CommandResult> {

        if (this.processing) {

            return {
                ...createCommandResult(),
                timestamp: Date.now(),
            };
        }


        this.processing =
            true;


        try {

            const command =
                this.queue.dequeue();


            if (!command) {

                return {
                    ...createCommandResult(),
                    timestamp: Date.now(),
                };
            }


            return this.middleware.execute(
                command,

                current =>
                    this.dispatcher.dispatch(
                        current,
                    ),
            );

        } finally {

            this.processing =
                false;
        }
    }


    public pending(): number {
        return this.queue.size();
    }


    public clear(): void {
        this.queue.clear();
    }


    public isProcessing(): boolean {
        return this.processing;
    }
}


export default CommandBus;
