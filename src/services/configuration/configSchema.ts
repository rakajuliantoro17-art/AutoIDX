/**
==========================================================
AURA Trade OS
Configuration Schema
Version : 0.3.0 Alpha
==========================================================
Configuration Schema Definition
==========================================================
*/

import type {

    Configuration,

} from "./configLoader";





/*
==========================================================
Types
==========================================================
*/

export type ConfigValueType =

    | "string"

    | "number"

    | "boolean";





export interface ConfigFieldSchema {

    type: ConfigValueType;

    required: boolean;

    defaultValue?: unknown;

}





/*
==========================================================
Schema
==========================================================
*/

export const configSchema:

Record<

    keyof Configuration,

    ConfigFieldSchema

> = {

    appName: {

        type: "string",

        required: true,

        defaultValue:

            "AURA Trade OS",

    },



    environment: {

        type: "string",

        required: true,

        defaultValue:

            "development",

    },



    version: {

        type: "string",

        required: true,

        defaultValue:

            "0.3.0",

    },



    apiSecret: {

        type: "string",

        required: false,

    },



    exchange: {

        type: "string",

        required: false,

    },

};
```

