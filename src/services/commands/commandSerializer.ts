/**
==========================================================
AURA Trade OS
Command Serializer
Version : 0.0.7 Alpha
==========================================================
*/

import {
    AURACommand,
} from "./command";

import type {
    SerializedCommand,
} from "./command";


export class CommandSerializer {

    public serialize(
        command: AURACommand,
    ): string {

        return JSON.stringify(
            command.serialize(),
        );
    }


    public deserialize(
        serialized: string,
    ):
        AURACommand {

        const parsed =
            JSON.parse(
                serialized,
            ) as SerializedCommand;


        return AURACommand.from(
            parsed,
        );
    }


    public serializeObject(
        command: AURACommand,
    ):
        SerializedCommand {

        return command.serialize();
    }


    public deserializeObject(
        command:
            SerializedCommand,
    ):
        AURACommand {

        return AURACommand.from(
            command,
        );
    }
}


export default CommandSerializer;
