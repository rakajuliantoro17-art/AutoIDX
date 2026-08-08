/**
==========================================================
AURA Trade OS
Command Normalizer
Version : 0.0.7 Alpha
==========================================================
*/

import {
    AURACommand,
} from "./command";

import {
    CommandType,
} from "./commandType";

import type {
    CommandOptions,
} from "./command";


export function normalizeCommand(
    command:
        AURACommand |
        CommandOptions,
):
    AURACommand {

    if (
        command instanceof AURACommand
    ) {
        return command;
    }


    return new AURACommand(
        command,
    );
}


export function normalizeCommandType(
    type:
        CommandType |
        string,
):
    CommandType {

    if (
        Object.values(
            CommandType,
        ).includes(
            type as CommandType,
        )
    ) {
        return type as CommandType;
    }


    throw new Error(
        `Unknown command type: ${type}`,
    );
}


export function isCommandType(
    value: unknown,
):
    value is CommandType {

    return (
        typeof value === "string" &&
        Object.values(
            CommandType,
        ).includes(
            value as CommandType,
        )
    );
}
