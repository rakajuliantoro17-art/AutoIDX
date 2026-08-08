/**
==========================================================
AURA Trade OS
JSON Serializer
Version : 0.3.0 Alpha
==========================================================
JSON Serializer
==========================================================
*/

export class JsonSerializer<T> {

    /*
    ======================================================
    Serialize
    ======================================================
    */

    public serialize(

        value: T,

    ): string {

        return JSON.stringify(

            value,

        );

    }

    /*
    ======================================================
    Deserialize
    ======================================================
    */

    public deserialize(

        data: string,

    ): T {

        return JSON.parse(

            data,

        ) as T;

    }

}

export const jsonSerializer =

    new JsonSerializer();
