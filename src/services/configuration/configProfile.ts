/**
==========================================================
AURA Trade OS
Configuration Profile
Version : 0.3.0 Alpha
==========================================================
Configuration Profiles
==========================================================
*/

import type {

    Configuration,

} from "./configLoader";





/*
==========================================================
Profile
==========================================================
*/

export type ConfigProfileName =

    | "development"

    | "testing"

    | "staging"

    | "production";





/*
==========================================================
Profiles
==========================================================
*/

export const configProfiles:

Record<

    ConfigProfileName,

    Partial<Configuration>

> = {





    development: {

        environment:

            "development",

    },





    testing: {

        environment:

            "testing",

    },





    staging: {

        environment:

            "staging",

    },





    production: {

        environment:

            "production",

    },

};





/*
==========================================================
Helper
==========================================================
*/

export function getProfile(

    profile:

        ConfigProfileName,

): Partial<Configuration> {

    return {

        ...configProfiles[

            profile

        ],

    };

}

