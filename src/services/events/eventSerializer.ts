/**
==========================================================
AURA Trade OS
Event Serializer
Version : 0.0.7 Alpha
==========================================================
*/

import {
    AURAEvent,
} from "./event";

import type {
    SerializedEvent,
} from "./event";


export class EventSerializer {

    public serialize(
        event: AURAEvent,
    ): string {

        return JSON.stringify(
            event.serialize(),
        );
    }


    public deserialize(
        serialized: string,
    ):
        AURAEvent {

        const parsed =
            JSON.parse(
                serialized,
            ) as SerializedEvent;

        return AURAEvent.from(
            parsed,
        );
    }


    public serializeObject(
        event: AURAEvent,
    ):
        SerializedEvent {

        return event.serialize();
    }


    public deserializeObject(
        event:
            SerializedEvent,
    ):
        AURAEvent {

        return AURAEvent.from(
            event,
        );
    }
}


export default EventSerializer;
