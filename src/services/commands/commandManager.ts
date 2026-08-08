/**
==========================================================
AURA Trade OS
Command Manager
Version : 0.0.7 Alpha
==========================================================
High-level Command Management
==========================================================
*/

import {
    AURACommand,
} from "./command";

import {
    CommandBus,
} from "./commandBus";

import {
    CommandSerializer,
} from "./commandSerializer";

import {
    normalizeCommand,
} from "./commandNormalizer";

import type {
    CommandOptions,
} from "./command";

import type {
    CommandHandler,
} from "./commandHandler";

import type {
    CommandType,
} from "./commandType";

import type {
    CommandResult,
} from "./commandResult";


export class CommandManager {

    public readonly bus:
        CommandBus;

    public readonly serializer:
        CommandSerializer;


    private started =
        false;


    public constructor(
        bus:
            CommandBus =
            new CommandBus(),
    ) {

        this.bus =
            bus;

        this.serializer =
            new CommandSerializer();
    }


    public start(): void {
        this.started = true;
    }


    public stop(): void {

        this.started =
            false;

        this.bus.clear();
    }


    public isStarted(): boolean {
        return this.started;
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

        return this.bus.register(
            type,
            handler,
            options,
        );
    }


    public unregister(
        type: CommandType,
        handlerId: string,
    ): boolean {

        return this.bus.unregister(
            type,
            handlerId,
        );
    }


    public async execute<
        T = unknown,
    >(
        options:
            CommandOptions<T>,
    ):
        Promise<CommandResult> {

        if (!this.started) {
            this.start();
        }


        const command =
            normalizeCommand(
                options,
            );


        return this.bus.execute(
            command,
        );
    }


    public async executeCommand<
        T = unknown,
    >(
        command:
            AURACommand<T>,
    ):
        Promise<CommandResult> {

        if (!this.started) {
            this.start();
        }


        return this.bus.execute(
            command,
        );
    }


    public createCommand<
        T = unknown,
    >(
        options:
            CommandOptions<T>,
    ):
        AURACommand<T> {

        return new AURACommand(
            options,
        );
    }


    public serialize(
        command:
            AURACommand,
    ): string {

        return this.serializer.serialize(
            command,
        );
    }


    public deserialize(
        serialized:
            string,
    ):
        AURACommand {

        return this.serializer.deserialize(
            serialized,
        );
    }


    public pendingCommands(): number {
        return this.bus.pending();
    }


    public clear(): void {
        this.bus.clear();
    }
}


export const commandManager =
    new CommandManager();


export default CommandManager;
