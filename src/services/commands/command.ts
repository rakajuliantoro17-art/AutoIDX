/**
==========================================================
AURA Trade OS
Command
Version : 0.0.7 Alpha
==========================================================
Core Command Model
==========================================================
*/

import {
    CommandCategory,
} from "./commandCategory";

import {
    CommandPriority,
} from "./commandPriority";

import {
    CommandStatus,
} from "./commandStatus";

import {
    CommandType,
} from "./commandType";

import type {
    CommandContext,
} from "./commandContext";

import type {
    CommandMetadata,
} from "./commandMetadata";

import type {
    CommandPayload,
} from "./commandPayload";


export interface CommandOptions<
    T = CommandPayload,
> {
    readonly id?: string;

    readonly type:
        CommandType;

    readonly category?:
        CommandCategory;

    readonly priority?:
        CommandPriority;

    readonly status?:
        CommandStatus;

    readonly payload?:
        T;

    readonly metadata?:
        CommandMetadata;

    readonly context?:
        CommandContext;

    readonly timestamp?:
        number;
}


export interface SerializedCommand {
    readonly id: string;

    readonly type: CommandType;

    readonly category: CommandCategory;

    readonly priority: CommandPriority;

    readonly status: CommandStatus;

    readonly payload: CommandPayload;

    readonly metadata: CommandMetadata;

    readonly context: CommandContext;

    readonly timestamp: number;
}


export class AURACommand<
    T = CommandPayload,
> {

    public readonly id: string;

    public readonly type: CommandType;

    public readonly category: CommandCategory;

    public readonly priority: CommandPriority;

    public status: CommandStatus;

    public readonly payload: T;

    public readonly metadata: CommandMetadata;

    public readonly context: CommandContext;

    public readonly timestamp: number;


    public constructor(
        options: CommandOptions<T>,
    ) {

        this.id =
            options.id ??
            createCommandId();

        this.type =
            options.type;

        this.category =
            options.category ??
            resolveCommandCategory(
                options.type,
            );

        this.priority =
            options.priority ??
            CommandPriority.NORMAL;

        this.status =
            options.status ??
            CommandStatus.CREATED;

        this.payload =
            options.payload ??
            (null as T);

        this.metadata =
            options.metadata ??
            {};

        this.context =
            options.context ??
            {};

        this.timestamp =
            options.timestamp ??
            Date.now();
    }


    public markQueued(): this {
        this.status =
            CommandStatus.QUEUED;

        return this;
    }


    public markProcessing(): this {
        this.status =
            CommandStatus.PROCESSING;

        return this;
    }


    public markCompleted(): this {
        this.status =
            CommandStatus.COMPLETED;

        return this;
    }


    public markFailed(): this {
        this.status =
            CommandStatus.FAILED;

        return this;
    }


    public markCancelled(): this {
        this.status =
            CommandStatus.CANCELLED;

        return this;
    }


    public markRejected(): this {
        this.status =
            CommandStatus.REJECTED;

        return this;
    }


    public isTerminal(): boolean {

        return (
            this.status ===
                CommandStatus.COMPLETED ||
            this.status ===
                CommandStatus.FAILED ||
            this.status ===
                CommandStatus.CANCELLED ||
            this.status ===
                CommandStatus.REJECTED
        );
    }


    public serialize():
        SerializedCommand {

        return {
            id: this.id,
            type: this.type,
            category: this.category,
            priority: this.priority,
            status: this.status,
            payload:
                this.payload as CommandPayload,
            metadata: this.metadata,
            context: this.context,
            timestamp: this.timestamp,
        };
    }


    public static from<
        T = CommandPayload,
    >(
        command: SerializedCommand,
    ):
        AURACommand<T> {

        return new AURACommand<T>({
            id: command.id,
            type: command.type,
            category:
                command.category,
            priority:
                command.priority,
            status:
                command.status,
            payload:
                command.payload as T,
            metadata:
                command.metadata,
            context:
                command.context,
            timestamp:
                command.timestamp,
        });
    }
}


export function createCommandId(): string {

    return [
        "cmd",
        Date.now().toString(36),
        Math.random()
            .toString(36)
            .slice(2, 10),
    ].join("-");
}


export function resolveCommandCategory(
    type: CommandType,
): CommandCategory {

    if (
        type.startsWith("SYSTEM_")
    ) {
        return CommandCategory.SYSTEM;
    }

    if (
        type.startsWith("MARKET_")
    ) {
        return CommandCategory.MARKET;
    }

    if (
        type.startsWith("STRATEGY_")
    ) {
        return CommandCategory.STRATEGY;
    }

    if (
        type.startsWith("RISK_")
    ) {
        return CommandCategory.RISK;
    }

    if (
        type.startsWith("ORDER_")
    ) {
        return CommandCategory.ORDER;
    }

    if (
        type.startsWith("POSITION_")
    ) {
        return CommandCategory.POSITION;
    }

    if (
        type.startsWith("PORTFOLIO_")
    ) {
        return CommandCategory.PORTFOLIO;
    }

    if (
        type.startsWith("TELEMETRY_")
    ) {
        return CommandCategory.TELEMETRY;
    }

    return CommandCategory.SYSTEM;
}


export function isAURACommand(
    value: unknown,
): value is AURACommand {
    return value instanceof AURACommand;
}


export default AURACommand;
